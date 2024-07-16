from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import io
import base64
import os
from prediction_functions import predict_private_attorney, predict_claim_amount

app = Flask(__name__)
CORS(app)

def save_plot_to_base64_and_close(figure_index, data_df):
    plot_description = ""
    plot_title = ''
    if figure_index == 1:
        fig, ax = plt.subplots(figsize=(10, 8))
        sns.kdeplot(data_df['Amount'], color='red', fill=True, ax=ax)
        ax.set_title('KDE Plot of Claim Amount')
        ax.set_xlabel('Amount')
        ax.set_ylabel('Density')
        plot_title = 'KDE Plot of Claim Amount'
        plot_description = """
        This plot visualizes the Kernel Density Estimate (KDE) of the AMOUNT column to show the shape of distribution within our dataset.
        """
    elif figure_index == 2:
        fig, ax = plt.subplots(figsize=(10, 8))
        sns.histplot(data_df['Severity'], color='green', kde=True, ax=ax)
        ax.set_title('Distribution of Severity')
        ax.set_xlabel('Severity')
        ax.set_ylabel('Frequency')
        plot_title = 'Distribution of Severity'
        plot_description = """
        This plot helps to infer which Severity class has majority of the claim Amounts.
        """
    elif figure_index == 3:
        fig, ax = plt.subplots(figsize=(10, 8))
        sns.histplot(data_df['Age'], color='orange', kde=True, ax=ax)
        ax.set_title('Distribution of Age')
        ax.set_xlabel('Age')
        ax.set_ylabel('Frequency')
        plot_title = 'Distribution of Age'
        plot_description = """
        This plot demonstrates the age distribution against the number of Claim amounts.
        """
    elif figure_index == 4:
        value_counts = data_df['Specialty'].value_counts()
        fig, ax = plt.subplots(figsize=(13, 10))
        value_counts.plot(kind='bar', color='skyblue', ax=ax)
        ax.set_title('Value Counts of SPECIALTY')
        ax.set_xlabel('SPECIALTY')
        ax.set_ylabel('Count')
        plot_title = 'Value Counts of SPECIALTY'
        plot_description = """
        This plot demonstrates the distribution of Medical Specialty and their corresponding number of Claim amounts.
        """
    elif figure_index == 5:
        value_counts = data_df['Insurance'].value_counts()
        fig, ax = plt.subplots(figsize=(10, 8))
        value_counts.plot(kind='bar', color='green', ax=ax)
        ax.set_title('Value Counts of INSURANCE')
        ax.set_xlabel('INSURANCE')
        ax.set_ylabel('COUNT')
        plot_title = 'Value Counts of INSURANCE'
        plot_description = """
        This bar plot showcases the distribution of different types of medical insurance carried by patients involved in the claims.
        """
    elif figure_index == 6:
        value_counts = data_df['Gender'].value_counts()
        fig, ax = plt.subplots(figsize=(10, 8))
        value_counts.plot(kind='bar', color='yellow', ax=ax)
        ax.set_title('Value Counts of GENDER')
        ax.set_xlabel('GENDER')
        ax.set_ylabel('COUNT')
        plot_title = 'Value Counts of GENDER'
        plot_description = """
        This bar plot illustrates the distribution of genders among the individuals involved in the claims.
        """
    elif figure_index == 7:
        insurance_counts = data_df['Insurance'].value_counts()
        fig, ax = plt.subplots(figsize=(10, 8))
        insurance_counts.plot.pie(autopct='%1.1f%%', ax=ax)
        ax.set_title('Distribution of INSURANCE types')
        ax.set_ylabel('')
        plot_title = 'Distribution of INSURANCE types'
        plot_description = """
        A pie chart showing different types of medical insurance carried by patients involved in the claims.
        """
    elif figure_index == 8:
        fig, ax = plt.subplots(figsize=(10, 8))
        sns.scatterplot(x=data_df['Age'], y=data_df['Amount'], color='yellow', ax=ax)
        ax.set_title('Scatter Plot of AMOUNT vs AGE')
        ax.set_xlabel('AGE')
        ax.set_ylabel('AMOUNT')
        plot_title = 'Scatter Plot of AMOUNT vs AGE'
        plot_description = """
        A scatter plot of Claim Amounts against Age of the patients.
        """
    elif figure_index == 9:
        average_amount_by_gender = data_df.groupby('Gender')['Amount'].mean().sort_values(ascending=False)
        fig, ax = plt.subplots(figsize=(10, 8))
        average_amount_by_gender.plot.bar(ax=ax)
        ax.set_title('Average Claim Amount by Gender')
        ax.set_xlabel('Gender')
        ax.set_ylabel('Average Amount')
        plt.xticks(rotation=0)
        plot_title = 'Average Claim Amount by Gender'
        plot_description = """
        This bar plot compares the average claim amounts between different genders within the dataset.
        """
    elif figure_index == 10:
        correlation_matrix = data_df.corr()
        fig, ax = plt.subplots(figsize=(10, 8))
        sns.heatmap(correlation_matrix, annot=False, cmap="coolwarm", linewidths=.5, ax=ax)
        ax.set_title('Correlation Matrix of the Variables')
        plot_title = 'Correlation Matrix of the Variables'
        plot_description = """
        This heatmap provides a visual representation of the correlation matrix computed from the variables in the dataset.
        """
    elif figure_index == 11:
        selected_columns = ['Amount', 'Severity', 'Age', 'Gender']
        pairplot = sns.pairplot(data_df[selected_columns], hue='Gender', palette='pastel', diag_kind='hist')
        fig = pairplot.fig
        fig.suptitle('Pairplot of Selected Variables', y=1.02)
        plot_title = 'Pairplot of Amount, Severity, Age and Gender'
        plot_description = """
        This pair plot shows relationships between Amount, Severity, Age, and Gender features.
        """
        img = io.BytesIO()
        fig.savefig(img, format='png')
        plt.close(fig)
        img.seek(0)
        plot_base64 = base64.b64encode(img.getvalue()).decode()
        return plot_base64, plot_description, plot_title

    elif figure_index == 12:
        gender_counts = data_df['Gender'].value_counts()
        fig, ax = plt.subplots(figsize=(10, 8))
        gender_counts.plot(kind='bar', color=['pink', 'lightblue'], ax=ax)
        ax.set_title('Distribution of Gender')
        ax.set_xlabel('Gender')
        ax.set_ylabel('Count')
        ax.set_xticks(ticks=[0, 1], labels=['Female', 'Male'], rotation=0)
        plot_title = 'Distribution of Gender'
        plot_description = """
        This bar plot displays the distribution of genders (Female and Male) within the claim data.
        """
    elif figure_index == 13:
        average_severity_by_gender = data_df.groupby('Gender')['Severity'].mean()
        fig, ax = plt.subplots(figsize=(10, 8))
        average_severity_by_gender.plot.bar(color=['maroon', 'blue'], ax=ax)
        ax.set_title('Average Severity by Gender')
        ax.set_xlabel('Gender')
        ax.set_ylabel('Average Severity')
        ax.set_ylim(1, 10)
        ax.set_yticks(range(1, 11))
        ax.set_xticks(ticks=[0, 1], labels=['Female', 'Male'], rotation=0)
        plot_title = 'Average Severity by Gender'
        plot_description = """
        A plot to compare the average severity ratings between different genders within the dataset.
        """

    img = io.BytesIO()
    fig.savefig(img, format='png')
    plt.close(fig)
    img.seek(0)
    plot_base64 = base64.b64encode(img.getvalue()).decode()
    return plot_base64, plot_description, plot_title

@app.route('/api/generate_insights', methods=['GET'])
def generate_insights():
    try:
        data_df = pd.read_csv('data/medicalMalpractice.csv')

        plots_base64 = []
        plot_descriptions = []
        plot_titles = []
        for i in range(1, 14):
            plot_base64, plot_description, plot_title = save_plot_to_base64_and_close(i, data_df)
            plots_base64.append(plot_base64)
            plot_descriptions.append(plot_description)
            plot_titles.append(plot_title)

        insights = {
            "plotBase64": plots_base64,
            "descriptions": plot_descriptions,
            "titles": plot_titles
        }
        return jsonify(insights), 200

    except Exception as e:
        app.logger.error("Error occurred:", str(e))
        return jsonify({"error": str(e)}), 400


@app.route('/api/upload_user_data_backend', methods=['POST'])
def upload_user_data_backend():
    try:
        uploaded_file = request.files['file']
        if uploaded_file.filename == '':
            return jsonify({"error": "No file uploaded or invalid file"}), 400

        user_upload_path = 'data/user_upload/'

        existing_files = os.listdir(user_upload_path)
        for file in existing_files:
            os.remove(os.path.join(user_upload_path, file))

        file_path = os.path.join(user_upload_path, uploaded_file.filename)
        uploaded_file.save(file_path)

        return jsonify({"message": "File uploaded successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route('/api/generate_user_data_insights', methods=['GET'])
def generate_user_data_insights():
    try:
        user_upload_path = 'data/user_upload/'
        file_list = os.listdir(user_upload_path)
        if len(file_list) == 0:
            return jsonify({"error": "No file uploaded yet"}), 400

        file_name = file_list[0]
        file_path = os.path.join(user_upload_path, file_name)

        data_df = pd.read_csv(file_path)

        plots_base64 = []
        plot_descriptions = []
        plot_titles = []
        for i in range(1, 14):
            plot_base64, plot_description, plot_title = save_plot_to_base64_and_close(i, data_df)
            plots_base64.append(plot_base64)
            plot_descriptions.append(plot_description)
            plot_titles.append(plot_title)

        insights = {
            "plotBase64": plots_base64,
            "descriptions": plot_descriptions,
            "titles": plot_titles
        }
        return jsonify(insights), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route('/predict_private_attorney', methods=['POST'])
def predict_private_attorney_route():
    try:
        data = request.json
        amount = data.get('Amount')
        severity = data.get('Severity')
        specialty = data.get('Specialty')
        insurance = data.get('Insurance')
        gender = data.get('Gender')
        dataset = data.get('Dataset')

        if dataset == 'Upload dataset':
            user_upload_path = 'data/user_upload/'
            file_list = os.listdir(user_upload_path)
            if len(file_list) == 0:
                return jsonify({"error": "No file uploaded yet"}), 400

            file_name = file_list[0]
            file_path = os.path.join(user_upload_path, file_name)
            data_file = pd.read_csv(file_path)

        else:
            data_file = pd.read_csv('data/medicalMalpractice.csv')

        X_test = pd.DataFrame({
            'Amount': [amount],
            'Severity': [severity],
            "Specialty": [specialty],
            "Insurance": [insurance],
            "Gender": [gender]
        })

        result = predict_private_attorney(data_file, X_test)
        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route('/predict_claim_amount', methods=['POST'])
def predict_claim_amount_route():
    try:
        data = request.json
        severity = data.get('Severity')
        specialty = data.get('Specialty')
        insurance = data.get('Insurance')
        gender = data.get('Gender')
        dataset = data.get('Dataset')

        if dataset == 'Upload dataset':
            user_upload_path = 'data/user_upload/'
            file_list = os.listdir(user_upload_path)
            if len(file_list) == 0:
                return jsonify({"error": "No file uploaded yet"}), 400

            file_name = file_list[0]
            file_path = os.path.join(user_upload_path, file_name)
            data_file = pd.read_csv(file_path)

        else:
            data_file = pd.read_csv('data/medicalMalpractice.csv')

        X_test = pd.DataFrame({
            'Severity': [severity],
            "Specialty": [specialty],
            "Insurance": [insurance],
            "Gender": [gender]
        })

        result = predict_claim_amount(data_file, X_test)
        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400


if __name__ == '__main__':
    app.run(debug=True)
