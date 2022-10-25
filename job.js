Moralis.Cloud.job("myJob", (request) =>  {
    // params: passed in the job call
    // headers: from the request that triggered the job
    // log: the Moralis Server logger passed in the request
    // message: a function to update the status message of the job object
    const { params, headers, log, message } = request;
    message("I just started");
    const query = new Moralis.Query("nfts");
    query.equalTo("status", "minted");    	
    query.notEqualTo("confirmed", true);
    const results = await query.find();
    if (results){
      for (let i = 0; i < results.length; i++){
        const result = results[i];
        const tokenId = result.get("tokenId");
        console.log('minted tokenId');
        const queryTransfers = new Moralis.Query("transfers");
        queryTransfers.equalTo("tokenId", tokenId);    	
        const transfer = await queryTransfers.first();
        if (transfer){
          result.set("confirmed", true);
          await result.save();
        }
      }
    }
    return true;
  });