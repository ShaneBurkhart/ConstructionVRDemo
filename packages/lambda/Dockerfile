FROM amazon/aws-lambda-python:3.7
MAINTAINER Shane Burkhart <shaneburkhart@gmail.com>

RUN yum install -y poppler-utils-0.26.5-43.22.amzn1

RUN pip install PyPDF2==1.26.0
RUN pip install boto3==1.17.56
RUN pip install pdf2image==1.14.0
RUN pip install httpx==0.17.1

# Copy function code
COPY . ${LAMBDA_TASK_ROOT}

ENV AWS_LAMBDA_FUNCTION_TIMEOUT=600