const AWS = require('aws-sdk');

exports.handler = async (event) => {
  console.log('Déclenchement de la fonction Lambda');

  // Configuration de l'AWS SDK pour DynamoDB
  const dynamoDB = new AWS.DynamoDB({ region: 'eu-west-3' });


// Paramètres de l'élément à ajouter
  let id =  event.body?.id;
  if (!id) {
    id = "6"
  }
  
  
  let type =  event.body?.type;
  if (!type) {
    type = "addToS3"
  }

  let content =  event.body?.content;
  if (!content) {
    content = "un contenu addToS3"
  }

  const params = {
    TableName: 'table_job',
    Item: {
      id: { N: id },
      job_type: { S: type },
      content: { S: content }
    },
  };



  try {
    // Appel de la méthode putItem pour ajouter l'élément à la table DynamoDB
    await dynamoDB.putItem(params).promise();

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
};
