#!/usr/bin/env python3

def lambda_handler(event, context):
    import boto3
    import json
    from datetime import datetime, timedelta

    print(f"#####################\n{event}\n######################")

    #### Variables ###
    # Check expense of site this many days back
    no_of_days = 30
    # Get first day of the month to check expenses for current month
    todays_date = datetime.now().replace(hour=23, minute=59, second=59)
    first_day_of_month = todays_date.replace(day=1).strftime('%Y-%m-%d')

    # Tag key on resources being checked
    tag_key = "AppName"
    tag_key = ""
    # Tag value on resources being checked
    tag_value = "edlresume.com"
    tag_value = ""

    # Cost Explorer client
    ce = boto3.client('ce')

    # End date is today
    end_date = datetime.today().strftime('%Y-%m-%d')
    # Start date is this many days ago (based on 'no_of_days' variable):
    start_date = (datetime.today() - timedelta(days=no_of_days)).strftime('%Y-%m-%d')

    ### Functions
    def get_cost_function(f_start_date, f_end_date, f_tag_key="", f_tag_value=""):
        if f_tag_key and f_tag_value:
            f_response = ce.get_cost_and_usage(
                TimePeriod={
                    'Start': f_start_date,
                    'End': f_end_date
                },
                Granularity='MONTHLY',
                Metrics=[
                    'BlendedCost',
                    'UnblendedCost',
                    'UsageQuantity'
                ],
                GroupBy=[
                    {
                        'Type': 'TAG',
                        'Key': f_tag_key
                    }
                ],
                Filter={
                    'Tags': {
                        'Key': tag_key,
                        'Values': [f_tag_value]
                    }
                }
            )
        else:
            f_response = ce.get_cost_and_usage(
                TimePeriod={
                    'Start': f_start_date,
                    'End': f_end_date
                },
                Granularity='MONTHLY',
                Metrics=[
                    'BlendedCost',
                    'UnblendedCost',
                    'UsageQuantity'
                ]
            )
        return f_response

    def get_cost_from_secrets_manager_function():
        todays_date_formatted = todays_date.strftime('%Y-%m-%d')
        todays_date_no_time = datetime.strptime(todays_date_formatted, '%Y-%m-%d')
        secrets_manager = boto3.client('secretsmanager', region_name = "us-east-2")
        website_cost_secret = json.loads(secrets_manager.get_secret_value(SecretId='websiteCost')['SecretString'])
        date_last_checked = datetime.strptime(website_cost_secret['date_last_checked'], '%Y-%m-%d')

        if todays_date_no_time > date_last_checked:
            print("We haven't checked the cost of the website today yet. Calling Cost Explorer!")
            print(f"todays date: {todays_date_no_time}")
            print(f"date last checked: {date_last_checked}")
            # Get cost and usage data for days in "no_of_days" variable (default is 30)
            last_x_no_of_days_expenses = get_cost_function(start_date, end_date, tag_key, tag_value)
            # last_x_no_of_days_expenses={'ResultsByTime': [{'TimePeriod': {'Start': '2024-01-07', 'End': '2024-02-01'}, 'Total': {'BlendedCost': {'Amount': '14.4318081004', 'Unit': 'USD'}, 'UnblendedCost': {'Amount': '14.4318081004', 'Unit': 'USD'}, 'UsageQuantity': {'Amount': '61327.9166937183', 'Unit': 'N/A'}}, 'Groups': [], 'Estimated': False}, {'TimePeriod': {'Start': '2024-02-01', 'End': '2024-02-06'}, 'Total': {'BlendedCost': {'Amount': '4.0506770909', 'Unit': 'USD'}, 'UnblendedCost': {'Amount': '4.0506770909', 'Unit': 'USD'}, 'UsageQuantity': {'Amount': '20852.1803009277', 'Unit': 'N/A'}}, 'Groups': [], 'Estimated': True}], 'DimensionValueAttributes': [], 'ResponseMetadata': {'RequestId': '77b66734-f1a4-4469-9bac-cfddf7facb9f', 'HTTPStatusCode': 200, 'HTTPHeaders': {'date': 'Tue, 06 Feb 2024 21:49:02 GMT', 'content-type': 'application/x-amz-json-1.1', 'content-length': '578', 'connection': 'keep-alive', 'x-amzn-requestid': '77b66734-f1a4-4469-9bac-cfddf7facb9f', 'cache-control': 'no-cache'}, 'RetryAttempts': 0}}

            last_x_no_of_days_expenses_total = [float(x['Total']['BlendedCost']['Amount']) for x in last_x_no_of_days_expenses['ResultsByTime']]
            rounded_sum_of_last_x_no_of_days_expenses_total = round(sum(last_x_no_of_days_expenses_total), 2)
            
            # Get cost and usage data for the current month
            current_month_expenses = get_cost_function(first_day_of_month, end_date, tag_key, tag_value)
            # current_month_expenses = {'ResultsByTime': [{'TimePeriod': {'Start': '2024-02-01', 'End': '2024-02-06'}, 'Total': {'BlendedCost': {'Amount': '4.0506770909', 'Unit': 'USD'}, 'UnblendedCost': {'Amount': '4.0506770909', 'Unit': 'USD'}, 'UsageQuantity': {'Amount': '20852.1803009277', 'Unit': 'N/A'}}, 'Groups': [], 'Estimated': True}], 'DimensionValueAttributes': [], 'ResponseMetadata': {'RequestId': '1d882346-53aa-4883-936b-87c048cb860a', 'HTTPStatusCode': 200, 'HTTPHeaders': {'date': 'Tue, 06 Feb 2024 21:49:02 GMT', 'content-type': 'application/x-amz-json-1.1', 'content-length': '312', 'connection': 'keep-alive', 'x-amzn-requestid': '1d882346-53aa-4883-936b-87c048cb860a', 'cache-control': 'no-cache'}, 'RetryAttempts': 0}}

            current_month_expenses_total = [float(x['Total']['BlendedCost']['Amount']) for x in current_month_expenses['ResultsByTime']]
            rounded_sum_of_current_month_expenses_total = round(sum(current_month_expenses_total), 2)

            html_body = f"Last 30 days cost of running this website: ${rounded_sum_of_last_x_no_of_days_expenses_total}<br>Current month's cost of running this website: ${rounded_sum_of_current_month_expenses_total}"

            update_secret_manager_date(todays_date_formatted, rounded_sum_of_last_x_no_of_days_expenses_total, rounded_sum_of_current_month_expenses_total)

        else:
            print("We checked the cost of the website today already. Using SecretManager's value instead of calling Cost Explorer!")
            website_cost_secret_last_x_no_of_days_expenses = website_cost_secret['last_x_no_of_days_expenses']
            website_cost_secret_current_month_expenses = website_cost_secret['current_month_expenses']
            
            html_body = f"Last 30 days cost of running website: ${website_cost_secret_last_x_no_of_days_expenses}<br>Current month's cost of running website: ${website_cost_secret_current_month_expenses}"

        return html_body

    def update_secret_manager_date(f_todays_date_formatted, f_last_x_no_of_days_expenses, f_current_month_expenses):
        secrets_manager = boto3.client('secretsmanager', region_name = "us-east-2")
        secrets_manager.update_secret(SecretId='websiteCost', SecretString='{"date_last_checked":"' + f_todays_date_formatted + '","last_x_no_of_days_expenses":"' + str(f_last_x_no_of_days_expenses) + '","current_month_expenses":"' + str(f_current_month_expenses) + '"}')
        

    html_body = get_cost_from_secrets_manager_function()

    api_response = {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'text/html; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
        },
        'body': f"<p>{html_body}</p>",
    }
    # api_response = {
    #     'statusCode': 200,
    #     'headers': {
    #         'Content-Type': 'text/html; charset=utf-8',
    #         'Access-Control-Allow-Origin': '*',
    #     },
    #     'body': "<p>Hello world!</p>",
    # }

    return api_response


print(lambda_handler(1, 2))
