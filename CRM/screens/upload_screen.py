import streamlit as st
from utils.data_processing import load_and_preprocess_data
from utils.state_manager import StateManager

def upload_file_screen():
    state_manager = StateManager()
    
    st.header("Upload your financial data file")
    
    # Check if there's existing data
    existing_data = state_manager.load_uploaded_data()
    if existing_data is not None:
        st.success("Previous data loaded successfully!")
        st.session_state.data = existing_data
        st.session_state.uploaded = True
    
    uploaded_file = st.file_uploader("Choose a file", type=["csv", "xlsx"])
    if uploaded_file is not None:
        data = load_and_preprocess_data(uploaded_file)
        state_manager.save_uploaded_data(data)
        st.session_state.data = data
        st.session_state.uploaded = True
        st.success("File uploaded and saved successfully!")