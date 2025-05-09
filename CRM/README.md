# CRM: Financial and Product Analysis App 

[StreamLit App](https://bettercallpaulocrm.streamlit.app)

<p>
   <a href="https://developer.mozilla.org/en-US/docs/Web/CSS">
    <img src="https://img.shields.io/badge/CSS-1572B6?style=for-the-badge&logo=css3&logoColor=white" />
   <a href="https://developer.mozilla.org/en-US/docs/Web/HTML">
    <img src="https://img.shields.io/badge/HTML-E34F26?style=for-the-badge&logo=html5&logoColor=white" />
   <a href="https://www.python.org/">
    <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  </a>
</p>

This project is a **Streamlit-based interactive web application** designed to analyze financial and product data. The app provides tools for data visualization, exploratory analysis, and insights generation. It is an excellent example of using Python and its ecosystem for data-driven decision-making.

The main goal of this project is to gather data from my private tutoring business and transform this data into insights about revenue fluctuation and student data that is relevant for business (Customer Lifetime Value, Business Median Customer Lifetime, Market Trends, Cancellation Rate...)

This is one of the projects from my portfolio to showcase my skills as a fullstack developer with deep business knowledge, dealing with data (ETL and Data Vis), statistics, AI (Language Model applied to Software Engineering), design, UX.

---

## **Main Functionality**

1. **Data Upload and Preprocessing:**
   - Allows users to upload financial data in CSV or XLSX formats.
   - Automatically preprocesses the uploaded data by standardizing column names, handling date-time conversions, and ensuring numeric consistency.

2. **Financial Data Analysis:**
   - Displays uploaded financial data in a clean and interactive table format.
   - Provides insights through visualizations, including:
     - **Monthly Revenue Trends:** Line charts to explore revenue patterns.
     - **Yearly Revenue Analysis:** Bar charts to compare annual revenue, calculate growth rates, and display average revenue per year.

3. **Custom User Interface:**
   - Stylish, interactive buttons and sidebar navigation for seamless user experience.
   - Centralized layout for consistent design across all app pages.

4. **Product Analysis (Under Development):**
   - Placeholder section for future development of product-related analytics.

---

## **Tech Stack**

- **Frontend:**  
  - **Streamlit:** Framework for building interactive, data-centric web applications.

- **Backend and Data Processing:**  
  - **Python:** Core programming language.
  - **Pandas:** For data manipulation and preprocessing.
  - **OpenPyXL:** To handle Excel file inputs.

- **Visualization:**  
  - **Plotly Express:** For creating interactive and dynamic charts.

- **Environment Management:**  
  - **Virtual Environment:** Python virtual environment (`venv`) ensures dependency isolation.

---

## **Data Techniques and Statistics Applied**

1. **Preprocessing Techniques:**
   - Standardized column names for easier handling.
   - Handled missing values and invalid formats during date and numeric conversions.

2. **Exploratory Data Analysis:**
   - Grouped and aggregated data to calculate:
     - Monthly and yearly revenue.
     - Revenue growth rates.
     - Average revenue per year.

3. **Visualization:**
   - Used line charts to highlight monthly revenue trends over time.
   - Leveraged bar charts for comparative yearly revenue analysis with custom formatting.

4. **Statistical Computation:**
   - Calculated percentage growth rates between consecutive years.
   - Derived averages for annual revenue to highlight trends and anomalies.

---

## **How to Run the App**

1. Clone the repository and navigate to the project directory:
   ```bash
   cd /home/paulo-yapper/Documents/Documentacao Dev/CRM
   ```

2. Activate the virtual environment and install dependencies:
   ```bash
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. Launch the Streamlit application:
   ```bash
   ./start_app.sh
   ```


---
## **Project Structure**

```
CRM/
├── main.py
├── requirements.txt
├── screens/
│   ├── home_screen.py
│   ├── upload_screen.py
│   ├── finance_screen.py
│   ├── product_screen.py
│   ├── kanban_screen.py
├── utils/
│   ├── data_processing.py
│   ├── state_manager.py
├── data/
├── data/

```
App is run by calling the 

/home/paulo-yapper/Documents/Documentacao Dev/CRM/venv/start_app.sh
---

## **Portfolio Relevance**

This project demonstrates proficiency in **data analysis**, **web development**, and **data visualization**. It showcases the ability to:
- Build interactive tools for real-time data exploration.
- Apply advanced data manipulation and statistical techniques.
- Create user-friendly applications with a focus on design and usability.
- Pro-activity towards developing the solution necessary for decision-making.
- Prompt Engineering on using Copilot, GPT and Claude to perform code edits, debugging, code review and help to implement the most effective statistical calculations.

