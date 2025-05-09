import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objs as go
import numpy as np

# Import the existing analysis functions from your previous implementation
from utils.data_processing import (
    calculate_customer_lifetime, 
    calculate_lifetime_value, 
    find_top_months, 
    find_cancellation_months
)

def process_customer_data(df):
    """
    Process customer data and return comprehensive analytics.
    :param df: DataFrame with customer payment data
    :return: Dictionary containing all analytics
    """
    results = {
        'customer_lifetime': calculate_customer_lifetime(df, 'Nome', 'Data de confirmação'),
        'lifetime_value': calculate_lifetime_value(df, 'Nome', 'Valor'),
        'top_months': find_top_months(df, 'Data de confirmação'),
        'cancellation_months': find_cancellation_months(df, 'Nome', 'Data de confirmação')
    }
    return results

def product_screen():
    st.header("Product and Customer Analysis")
    
    # Check if data is uploaded
    if 'uploaded' not in st.session_state or not st.session_state.uploaded:
        st.warning("Please upload data first in the 'Upload New Data' section.")
        return
    
    # Get the data
    data = st.session_state.data
    
    # Print available columns for debugging
    # st.write("Available columns:", list(data.columns))
    
    # Tabs for different analyses
    tab1, tab2, tab3, tab4 = st.tabs([
        "Customer Lifetime", 
        "Lifetime Value", 
        "Enrollment Trends", 
        "Cancellation Analysis"
    ])
    
    with tab1:
        try:
            show_customer_lifetime(data)
        except Exception as e:
            st.error(f"Error in Customer Lifetime analysis: {e}")
    
    with tab2:
        try:
            show_lifetime_value(data)
        except Exception as e:
            st.error(f"Error in Lifetime Value analysis: {e}")
    
    with tab3:
        try:
            show_enrollment_trends(data)
        except Exception as e:
            st.error(f"Error in Enrollment Trends analysis: {e}")
    
    with tab4:
        try:
            show_cancellation_analysis(data)
        except Exception as e:
            st.error(f"Error in Cancellation Analysis: {e}")


def show_customer_lifetime(data):
    """Display customer lifetime metrics."""
    st.subheader("Customer Lifetime Analysis")
    
    lifetime = calculate_customer_lifetime(data, 'Nome', 'Data de confirmação')
    
    # Visualize distribution of customer lifetimes
    fig = px.histogram(
        lifetime.reset_index(), 
        x='customer_lifetime_months', 
        title='Distribution of Customer Lifetimes',
        labels={'customer_lifetime_months': 'Lifetime (Months)'}
    )
    st.plotly_chart(fig)
    
    # Key statistics
    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Average Lifetime", f"{lifetime['customer_lifetime_months'].mean():.1f} months")
    with col2:
        st.metric("Median Lifetime", f"{lifetime['customer_lifetime_months'].median():.1f} months")
    with col3:
        st.metric("Max Lifetime", f"{lifetime['customer_lifetime_months'].max():.1f} months")
    
    # Detailed customer lifetime table
    st.dataframe(lifetime)

def show_lifetime_value(data):
    """Display lifetime value metrics."""
    st.subheader("Lifetime Value (LTV) Analysis")
    
    ltv_data = calculate_lifetime_value(data, 'Nome', 'Valor')
    
    # Visualize LTV distribution
    fig = px.box(
        ltv_data.reset_index(), 
        x='total_value', 
        title='Distribution of Customer Lifetime Values'
    )
    st.plotly_chart(fig)
    
    # Key LTV statistics
    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Total LTV", f"R$ {ltv_data['total_value'].sum():,.2f}")
    with col2:
        st.metric("Average LTV", f"R$ {ltv_data['total_value'].mean():,.2f}")
    with col3:
        st.metric("Median LTV", f"R$ {ltv_data['total_value'].median():,.2f}")
    
    # Top 10 customers by LTV
    st.subheader("Top 10 Customers by Lifetime Value")
    st.dataframe(ltv_data.nlargest(10, 'total_value'))

# In screens/product_screen.py

def show_enrollment_trends(data):
    """Display enrollment trends over time as a bar chart."""
    st.subheader("Enrollment Trends Analysis")
    
    try:
        # Get enrollment trends using 'Data de confirmação'
        enrollment_trends, total_years = find_top_months(data, 'Data de confirmação')
        
        if enrollment_trends.empty:
            st.warning("No enrollment trend data found.")
            return
        
        # Create a bar chart to visualize the number of enrollments per month
        fig = go.Figure(data=go.Bar(
            x=enrollment_trends.index.astype(str),  # Month numbers as strings
            y=enrollment_trends.values,  # Number of enrollments
            marker=dict(color='blue')
        ))
        
        fig.update_layout(
            title='New Client Enrollments by Month',
            xaxis_title='Month',
            yaxis_title='Number of New Clients',
            xaxis=dict(tickvals=[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                       ticktext=['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                                 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'])
        )
        
        st.plotly_chart(fig)
        
        # Display summary statistics
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("Total Months", 12)  # Always 12 months
        with col2:
            peak_month = enrollment_trends.idxmax()
            st.metric("Peak Month", str(peak_month), int(enrollment_trends.max()))  # Convert to int
        with col3:
            # Calculate average monthly enrollments per year
            avg_monthly_enrollments = enrollment_trends.mean() / max(total_years, 1)
            st.metric("Avg Monthly Enrollments", f"{avg_monthly_enrollments:.1f}")
        
        # Display detailed data
        st.dataframe(enrollment_trends.reset_index().rename(
            columns={'index': 'Month', 0: 'New Clients'}
        ), use_container_width=True)
        
    except Exception as e:
        st.error(f"Error in displaying enrollment trends: {str(e)}")


def show_cancellation_analysis(data):
    """Display client cancellation trends over time as a bar chart."""
    st.subheader("Client Cancellation Trends Analysis")
    
    try:
        # Get cancellation trends using default parameters
        cancellation_trends, total_years = find_cancellation_months(data)
        
        if cancellation_trends.empty:
            st.warning("No cancellation trend data found.")
            return
        
        # Create a bar chart to visualize the number of cancellations per month
        fig = go.Figure(data=go.Bar(
            x=cancellation_trends.index.astype(str),  # Month numbers as strings
            y=cancellation_trends.values,  # Number of cancellations
            marker=dict(color='red')  # Use red to indicate cancellations
        ))
        
        fig.update_layout(
            title='Client Cancellations by Month',
            xaxis_title='Month',
            yaxis_title='Number of Client Cancellations',
            xaxis=dict(tickvals=[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                       ticktext=['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                                 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'])
        )
        
        st.plotly_chart(fig)
        
        # Display summary statistics
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("Total Months", 12)  # Always 12 months
        with col2:
            peak_month = cancellation_trends.idxmax()
            st.metric("Peak Cancellation Month", str(peak_month), int(cancellation_trends.max()))  # Convert to int
        with col3:
            # Calculate average monthly cancellations per year
            avg_monthly_cancellations = cancellation_trends.mean() / max(total_years, 1)
            st.metric("Avg Monthly Cancellations", f"{avg_monthly_cancellations:.1f}")
        
        # Option to customize cancellation gap
        gap_months = st.slider(
            "Adjust Cancellation Gap (Months)", 
            min_value=1, 
            max_value=6, 
            value=3, 
            help="Define how many months without payment constitutes a cancellation"
        )
        
        # Rerun analysis with selected gap if different from default
        if gap_months != 3:
            cancellation_trends, total_years = find_cancellation_months(data, gap_months=gap_months)
            
            # Update chart with new data
            fig = go.Figure(data=go.Bar(
                x=cancellation_trends.index.astype(str),
                y=cancellation_trends.values,
                marker=dict(color='red')
            ))
            
            fig.update_layout(
                title=f'Client Cancellations by Month (Gap: {gap_months} Months)',
                xaxis_title='Month',
                yaxis_title='Number of Client Cancellations',
                xaxis=dict(tickvals=[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                           ticktext=['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'])
            )
            
            st.plotly_chart(fig)
        
        # Display detailed data
        st.dataframe(cancellation_trends.reset_index().rename(
            columns={'index': 'Month', 0: 'Cancellations'}
        ), use_container_width=True)
        
    except Exception as e:
        st.error(f"Error in displaying cancellation analysis: {str(e)}")

