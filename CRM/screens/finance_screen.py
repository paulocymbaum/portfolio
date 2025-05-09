import streamlit as st
import plotly.express as px
import pandas as pd  # Add this import
from datetime import datetime

def finance_screen():
    if 'uploaded' in st.session_state and st.session_state.uploaded:
        data = st.session_state.data
        display_financial_data(data)
        visualize_data(data)
    else:
        st.warning("Please upload your data first in the 'Upload New Data' section.")

def display_financial_data(df):
    st.header("Financial Data")
    st.dataframe(df)

def visualize_data(df):
    st.header("Data Visualization")
    
    # Monthly Revenue Plot
    df['month'] = df['data_de_confirmacao'].dt.to_period('M')
    monthly_revenue = df.groupby('month')['valor'].sum().reset_index()
    monthly_revenue['month'] = monthly_revenue['month'].dt.to_timestamp()
    
    fig = px.line(monthly_revenue, x='month', y='valor', title='Monthly Revenue')
    st.plotly_chart(fig)
    
    # Yearly Revenue Analysis
    st.header("Yearly Revenue Analysis")
    df['year'] = df['data_de_confirmacao'].dt.year
    monthly_revenue_by_year = df.groupby([df['data_de_confirmacao'].dt.to_period('M')])['valor'].sum().reset_index()
    monthly_revenue_by_year['year'] = monthly_revenue_by_year['data_de_confirmacao'].dt.year
    yearly_revenue = monthly_revenue_by_year.groupby('year')['valor'].sum().reset_index()
    yearly_revenue['growth'] = yearly_revenue['valor'].pct_change() * 100
    yearly_revenue['average_revenue'] = monthly_revenue_by_year.groupby('year')['valor'].mean().reset_index()['valor']
    
    # Formatting
    yearly_revenue['year'] = yearly_revenue['year'].astype(int)
    yearly_revenue['valor_numeric'] = yearly_revenue['valor']  # Keep a numeric version for plotting
    yearly_revenue['valor'] = yearly_revenue['valor'].apply(lambda x: f"R$ {x:,.2f}")
    
    # Modify growth column handling
    yearly_revenue['growth'] = yearly_revenue['growth'].apply(
        lambda x: f"{x:.2f}%" if pd.notnull(x) and not pd.isna(x) else "N/A"
    )
    
    yearly_revenue['average_revenue'] = yearly_revenue['average_revenue'].apply(lambda x: f"R$ {x:,.2f}")
    
    st.dataframe(yearly_revenue)
    
    # Create a bar chart for yearly revenue
    fig_yearly = px.bar(yearly_revenue, x='year', y='valor_numeric', title='Yearly Revenue', text='valor')
    fig_yearly.update_traces(texttemplate='%{text}', textposition='outside')
    fig_yearly.update_layout(
        xaxis_title='Year',
        yaxis_title='Total Revenue (R$)',
        uniformtext_minsize=8,
        uniformtext_mode='hide',
        xaxis=dict(type='category')
    )
    st.plotly_chart(fig_yearly)