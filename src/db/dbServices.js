const create = (model, data) => new Promise((resolve, reject) => {
    model.create(data, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
}); 

export default create;