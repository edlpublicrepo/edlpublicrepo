#!/usr/bin/env python3

def lambda_handler(event, context):
    import boto3
    from datetime import datetime, timedelta

    # Initialize a CloudWatch client
    cloudwatch = boto3.client('cloudwatch', region_name='us-east-1') # CloudWatch metrics for CloudFront are available in us-east-1

    # Specify your CloudFront distribution ID
    distribution_id = 'E3R8JRJMF9MBYL'

    end_time = datetime.utcnow()
    start_time = end_time - timedelta(days=30)

    # Retrieve metrics
    response = cloudwatch.get_metric_statistics(
        Namespace='AWS/CloudFront',
        MetricName='Requests',
        Dimensions=[
            {
                'Name': 'DistributionId',
                'Value': distribution_id
            },
            {
                'Name': 'Region',
                'Value': 'Global'
            }
        ],
        StartTime=start_time,
        EndTime=end_time,
        Period=86400, # The granularity of the returned data points (in seconds), 86400s = 24 hours
        Statistics=['Sum']
    )

    # Print the results
    sum_of_hits_on_website = int(sum([num_of_hits['Sum'] for num_of_hits in response['Datapoints']])) // 30

    html_body = f"Website hit count for last 30 days (updated daily): {sum_of_hits_on_website}"

    api_response = {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'text/html; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
        },
        'body': f"<p>{html_body}</p>",
    }

    return api_response



print(lambda_handler(1, 2))
