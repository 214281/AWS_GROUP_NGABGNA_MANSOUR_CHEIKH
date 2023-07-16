provider "aws"{
    region = "eu-west-3"
    access_key = "AKIAU4S3ED3MDWOQTD6Q"
    secret_key= "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"
}

//Cléation de la clé ssh
resource "tls_private_key" "ec2key"{
    algorithm = "RSA"
    rsa_bits = 2048
}

//creation de notre table 
resource "aws_db_instance" "table_job" {
    name = "table_job"
    billing_mode = "PAY_PER_REQUEST"
    hash_key = "id"


    attribute {
        name = "id"
        type = "N"
    }
    attribute{
        name="content"
        type="S"
    }
    attribute{
        name="job_type"
        type="S"
    }
    attribute{
        name="isProcessed"
        type="B"
    }

    global_secondary_index {
        name = "job_type_index"
        hash_key = "job_type"
        projection_type = "ALL"
        read_capacity = 5
        write_capacity = 5
    }

    global_secondary_index{
        name="isProcessed_index"
        hash_key="isProcessed"
        projection_type="ALL"
        read_capacity=5
        write_capacity=5
    }

    global_secondary_index{
        name="content_index"
        hash_key="content"
        projection_type="ALL"
        read_capacity=5
        write_capacity=5
    }

    lifecycle {
        prevent_destroy = true
    }
}

//Creation de la table 
resource "aws_dynamodb_table" "dbDynamo" {
    name = "dbDynamo"
    billing_mode = "PAY_PER_REQUEST"
    hash_key = "id"

    attribute{ 
        name = "id"
        type = "N"
    }
    lifecycle {
        prevent_destroy = true
    }
}

//creation de notre bucket 
resource "aws_s3_bucket" "mansourarnaudcheikh"{
    bucket = "mansourarnaudcheikh"

    tags = {
        Name = "mansourarnaudcheikh"
        Environment = "Dev"
    }
}

//Selection de notre BD
resource "aws_lambda_function" "dbSelect"{
    filename = "./dbSelect.zip"
    function_name = "dbSelect"
    role = ""
    handler = "dbSelect.lambda_handler"
    runtime = "nodejs14.x"
    source_code_hash = filebase64sha256("./dbSelect.zip")

    environment {
        variables = {
            TABLE_NAME = "dbDynamo"
        }
    }
}

// Parametrage de notre déclencheur CloudWatch Events
resource "aws_cloudwatch_event_rule" "job_event_rule" {
    name = "job_event_rule"
    description = "Trigger the lambda function"

    event_pattern = <<EOF
    {
        "source": [
            "aws.dynamodb"
        ],
        "detail-type": [
            "AWS API Call via CloudTrail"
        ],
        "detail": {
    "eventSourceARN": ["${aws_dynamodb_table.table_job.arn}"],
    "eventName": ["INSERT", "MODIFY"]
  }
    
    }
    EOF
}
    

resource "aws_cloudwatch_event_target" "job_event_target" {
    rule = aws_cloudwatch_event_rule.job_event_rule.name
    arn = aws_lambda_function.dbSelect.arn
    target_id = "job_event_target"
}