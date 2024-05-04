
import ejs from "ejs"
import path from "path"
const __basedir = path.resolve()
import dotenv from "dotenv";
import SibApiV3Sdk from "sib-api-v3-sdk"
dotenv.config({
  path:"./.env"
})


// SendInBlue Setup to send email
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'] ;
apiKey.apiKey = process.env.SIB_API_KEY;
const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

export const sendMail =  async (obj) => {

    let htmlText = '';
    if (obj.template){
      htmlText = await ejs.renderFile(`${__basedir}${obj.template}/html.ejs`, {data:obj.data || null});
    }
  
    const sender ={
      email:process.env.COMPANY_EMAIL,
      name:process.env.COMPANY_NAME
    }
    
    const receivers = [
      {
        email: obj.to
      }
    ]
  console.log(sender,'sender');
  console.log(receivers,'reciever');
  
    return tranEmailApi.sendTransacEmail({
      sender,
      to:receivers,
      subject: "Welcome To Learning Backend",
      htmlContent: htmlText
    }).then(console.log).catch(console.log)
  
  
  };