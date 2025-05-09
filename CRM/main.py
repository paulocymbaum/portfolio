import streamlit as st
import os
from utils.state_manager import StateManager

# Import individual screens
from screens.home_screen import show_home_screen
from screens.upload_screen import upload_file_screen
from screens.finance_screen import finance_screen
from screens.product_screen import product_screen
from screens.kanban_screen import show_kanban_screen, handle_component_events 

def load_custom_css():
    # Load custom CSS
    css_path = os.path.join(os.path.dirname(__file__), 'styles', 'custom_styles.css')
    with open(css_path, 'r') as f:
        st.markdown(f'<style>{f.read()}</style>', unsafe_allow_html=True)

def initialize_session_state():
    """Initialize all required session state variables"""
    if 'current_page' not in st.session_state:
        st.session_state.current_page = "Home"
    if 'uploaded' not in st.session_state:
        st.session_state.uploaded = False
    if 'leads' not in st.session_state:
        st.session_state.leads = []
    if 'show_modal' not in st.session_state:
        st.session_state.show_modal = False
    if 'edit_mode' not in st.session_state:
        st.session_state.edit_mode = False
    if 'current_lead' not in st.session_state:
        st.session_state.current_lead = None

def main():
    # Set page config before any other Streamlit commands
    st.set_page_config(page_title="Financial and Product Analysis App", layout="wide")
    
    # Initialize state and load data
    initialize_session_state()
    state_manager = StateManager()
    
    # Load custom styles
    load_custom_css()
    
    # Load leads if not already loaded
    if not st.session_state.leads:
        st.session_state.leads = state_manager.load_leads() or []
     
    # Title
    st.title("Financial and Product Analysis App")
    
    # Sidebar Navigation Title
    st.sidebar.markdown("<h1 style='text-align: center; margin-bottom: 20px;'>Navigation</h1>", unsafe_allow_html=True)
    
    # Create buttons with centralized layout
    buttons = [
        "Home", 
        "Upload New Data", 
        "Finance", 
        "Product",
        "Lead Management"
    ]
    
    # Create buttons in the sidebar
    for button_name in buttons:
        if st.sidebar.button(button_name, 
                           key=button_name, 
                           use_container_width=True):
            st.session_state.current_page = button_name
            # Clear any component-specific state when switching pages
            if button_name != "Lead Management":
                if 'edit_lead' in st.session_state:
                    del st.session_state.edit_lead
                if 'delete_lead' in st.session_state:
                    del st.session_state.delete_lead
                st.session_state.show_modal = False
                st.session_state.edit_mode = False
                st.session_state.current_lead = None
    
    # Render the appropriate screen based on current page
    if st.session_state.current_page == "Home":
        show_home_screen()
    elif st.session_state.current_page == "Upload New Data":
        upload_file_screen()
    elif st.session_state.current_page == "Finance":
        finance_screen()
    elif st.session_state.current_page == "Product":
        product_screen()
    elif st.session_state.current_page == "Lead Management":
        handle_component_events()
        show_kanban_screen()

    # Load any existing data if not already loaded
    if not st.session_state.uploaded:
        data = state_manager.load_uploaded_data()
        if data is not None:
            st.session_state.data = data
            st.session_state.uploaded = True

if __name__ == "__main__":
    main()