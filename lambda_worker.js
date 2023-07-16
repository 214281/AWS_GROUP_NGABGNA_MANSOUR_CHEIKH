const AWS = require('aws-sdk');

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const fs = require('fs');

exports.handler = async (event) => {

  try {

    const params = {

      TableName: 'table_job',

      ScanIndexForward: false,

      Limit: 1

    };


    // Récupérer le dernier élément inséré dans la table DynamoDB

    const result = await dynamoDB.scan(params).promise();

    const latestItem = result.Items[0];


    // Effectuer le contrôle sur l'une des colonnes (par exemple, "job_type")

    const jobType = latestItem.job_type;
    const constcontent = latestItem.content;

    if (jobType === 'addToDynamoDB') {

      console.log('Le dernier élément a un job_type "dbDynamo"');
 

      // Paramètres de l'élément à ajouter

      const params = {

        TableName: 'dbDynamo',

       Item:{

          id: latestItem.id,

          content: constcontent

        }

      };

      try {
        // Appel de la méthode put pour ajouter l'élément à la table DynamoDB
        await dynamoDB.put(params).promise();

        console.log('Élément ajouté avec succès à la table DynamoDB');

        const response = {
          statusCode: 200,
          body: JSON.stringify('OK')
        };

        return response;
      } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'élément à la table DynamoDB', error);
        const response = {

          statusCode: 500,

          body: JSON.stringify('Erreur lors de l\'ajout de l\'élément à la table DynamoDB')

        };

        return response;
      }
    } else if (jobType === 'mansourarnaudcheikh'){
      const s3 = new AWS.S3();
      
      let fileName = (new Date()).getTime() + '.txt';
      let bufferData = Buffer.from(constcontent, 'utf8');

      s3.upload({
        Bucket: 'mansourarnaudcheikh', 
        Body: bufferData,
        Key: fileName,
      }, function(err, data) {
        if (err) {
          throw err;
          //console.error("Erreur lors de l'upload: " + err.message);
        }

        return {
          statusCode: 200,
          body: 'Upload effectué avec succès: ' + (JSON.stringify(data)),
        };
      });

    }
  } catch (error) {
    console.error('Erreur lors du contrôle :', error);

    return {
      statusCode: 500,
      body: 'Erreur lors du contrôle'
    };
  }
};

async function createFile(content) {
 let fileName = (new Date()).getTime() + '.txt';
  await fs.writeFileSync(fileName, content, err => {
    if (err) {
      throw err;
      //console.error(err.message);
    }
  });

  return Promise.resolve({name: fileName});
}
