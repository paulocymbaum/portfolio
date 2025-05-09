import streamlit as st
from utils.state_manager import StateManager
import time
import json

def show_kanban_screen():
    state_manager = StateManager()
    
    # Initialize states
    if 'leads' not in st.session_state:
        st.session_state.leads = state_manager.load_leads() or []
    if 'show_modal' not in st.session_state:
        st.session_state.show_modal = False
    if 'edit_mode' not in st.session_state:
        st.session_state.edit_mode = False
    if 'current_lead' not in st.session_state:
        st.session_state.current_lead = None
    
    header_col1, header_col2 = st.columns([4,1])
    
    with header_col1:
        st.title("Kanban Board")
    
    with header_col2:
        if st.button("➕ New Lead", key="add-lead-btn", use_container_width=True):
            st.session_state.show_modal = True
            st.session_state.edit_mode = False
            st.session_state.current_lead = None
    
    # Define statuses
    statuses = ["New Lead", "Contacted", "Pitched", "Converted"]
    
    # Show modal for both new lead and edit lead
    if st.session_state.show_modal:
        with st.form("lead_form", clear_on_submit=True):
            if st.session_state.edit_mode and st.session_state.current_lead:
                st.subheader("Edit Lead")
                initial_name = st.session_state.current_lead.get('name', '')
                initial_email = st.session_state.current_lead.get('email', '')
            else:
                st.subheader("Add New Lead")
                initial_name = ''
                initial_email = ''
            
            name = st.text_input("Name*", value=initial_name, key="lead_name")
            email = st.text_input("Email*", value=initial_email, key="lead_email")
            
            col1, col2 = st.columns(2)
            with col1:
                submit = st.form_submit_button("Save")
            with col2:
                if st.form_submit_button("Cancel"):
                    st.session_state.show_modal = False
                    st.session_state.edit_mode = False
                    st.session_state.current_lead = None
                    st.experimental_rerun()
            
            if submit:
                if name:
                    if st.session_state.edit_mode and st.session_state.current_lead:
                        # Update existing lead
                        lead_id = st.session_state.current_lead['id']
                        for lead in st.session_state.leads:
                            if lead['id'] == lead_id:
                                lead['name'] = name
                                lead['email'] = email
                        success_msg = "Lead updated successfully!"
                    else:
                        # Create new lead
                        new_lead = {
                            "id": str(int(time.time())),
                            "name": name,
                            "email": email if email else "No Email",
                            "status": "New Lead"
                        }
                        st.session_state.leads.append(new_lead)
                        success_msg = "New lead created successfully!"
                    
                    # Save to file
                    if state_manager.save_leads(st.session_state.leads):
                        st.success(success_msg)
                        st.session_state.show_modal = False
                        st.session_state.edit_mode = False
                        st.session_state.current_lead = None
                        st.experimental_rerun()
                    else:
                        st.error("Failed to save changes. Please try again.")
                else:
                    st.error("Please fill in all required fields")

    # Render Kanban board
    kanban_html = create_kanban_component(st.session_state.leads, statuses)
    st.components.v1.html(kanban_html, height=700, scrolling=False)

def create_kanban_component(leads, statuses):
    """Create the HTML/JS component for the Kanban board."""
    with open('styles/custom_styles.css', 'r') as css_file:
        custom_css = css_file.read()

    board_html = f"""
    <style>
    {custom_css}
    </style>
    <div class="kanban-container">
        <div class="kanban-board">
    """

    for status in statuses:
        board_html += f"""
        <div class="column" data-status="{status}">
            <div class="column-header">{status}</div>
        """

        for lead in [lead for lead in leads if lead.get("status") == status]:
            board_html += f"""
            <div class="card" data-id="{lead['id']}">
                <div class="card-actions">
                    <button class="icon-btn edit-icon" onclick="editLead('{lead['id']}')">✏️</button>
                    <button class="icon-btn delete-icon" onclick="deleteLead('{lead['id']}')">🗑️</button>
                </div>
                <h4>{lead['name']}</h4>
                <p>{lead['email']}</p>
            </div>
            """
        
        board_html += "</div>"
    
    board_html += """
        </div>
    </div>

    <script>
    function editLead(leadId) {
        const leads = %s;
        const lead = leads.find(l => l.id === leadId);
        if (lead) {
            window.parent.postMessage({
                type: 'streamlit:set',
                key: 'edit_lead',
                value: lead
            }, '*');
        }
    }

    function deleteLead(leadId) {
        if (confirm('Are you sure you want to delete this lead?')) {
            window.parent.postMessage({
                type: 'streamlit:set',
                key: 'delete_lead',
                value: leadId
            }, '*');
        }
    }
    </script>
    """ % json.dumps(leads)

    return board_html

def handle_component_events():
    """Handle component events from JavaScript."""
    if 'edit_lead' in st.session_state:
        lead_data = st.session_state.edit_lead
        if isinstance(lead_data, dict) and 'id' in lead_data:
            st.session_state.show_modal = True
            st.session_state.edit_mode = True
            st.session_state.current_lead = lead_data
            del st.session_state.edit_lead
            st.experimental_rerun()
    
    if 'delete_lead' in st.session_state:
        lead_id = st.session_state.delete_lead
        st.session_state.leads = [lead for lead in st.session_state.leads if lead['id'] != lead_id]
        state_manager = StateManager()
        if state_manager.save_leads(st.session_state.leads):
            st.success("Lead deleted successfully!")
        else:
            st.error("Failed to delete lead. Please try again.")
        del st.session_state.delete_lead
        st.experimental_rerun()