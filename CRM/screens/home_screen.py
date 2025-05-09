import streamlit as st

def show_home_screen():
    # Screen 1: Show logo and Loading state
    st.image("logo.png", width=120)  # Resize logo to 120x120
    st.header("Welcome to the Financial and Product Analysis App")
    st.write("Please navigate to the 'Upload New Data' section to get started.")