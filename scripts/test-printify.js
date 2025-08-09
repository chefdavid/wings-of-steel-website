import fetch from 'node-fetch';

const API_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzN2Q0YmQzMDM1ZmUxMWU5YTgwM2FiN2VlYjNjY2M5NyIsImp0aSI6IjZlZjUxZmE3ZDViY2IwZDA5NTU3NDYzNDE2ZTZiZTk1YjQ4YzE0ZDYwZWEyMzdiYjEwMjNkNzZlYjdhN2JkMGJmMDQ1NGUxNzdjZTVkM2E0IiwiaWF0IjoxNzU0NjYxODcyLjcxNDIyMywibmJmIjoxNzU0NjYxODcyLjcxNDIyNSwiZXhwIjoxNzg2MTk3ODcyLjcwNjA2MSwic3ViIjoiMTY4MzIyODkiLCJzY29wZXMiOlsic2hvcHMubWFuYWdlIiwic2hvcHMucmVhZCIsImNhdGFsb2cucmVhZCIsIm9yZGVycy5yZWFkIiwib3JkZXJzLndyaXRlIiwicHJvZHVjdHMucmVhZCIsInByb2R1Y3RzLndyaXRlIiwid2ViaG9va3MucmVhZCIsIndlYmhvb2tzLndyaXRlIiwidXBsb2Fkcy5yZWFkIiwidXBsb2Fkcy53cml0ZSIsInByaW50X3Byb3ZpZGVycy5yZWFkIiwidXNlci5pbmZvIl19.c0pHnUE_Nf49vjTz07A6Dk0Oqllb2w2xyO4cwcyIrrGOUZ0xUx9XXUY5vSS3UJrUV8-0Kj7lQhOp0E6Vuw5dYHIK1MbgZUEFhkRaKt_3h2XzK2b1zw-Gyu3xD03bIZ0pIZEo97L0wQ4N5C8DYY-0CX3PS-hsPcOicR2_cUqQOi-9U-TEuAFb_28aaA7W3ongHQuZI6VIyR8JKb75ihcy0DcErJhfNR_oZKbEaefn8Hq9dZCamYuZe-AHVBJi-hSn8SY89qz4oMhEyeW9yY3KSKs_D80rGt3Ol6dVH1ZSrjF3gBOecfZZeD3gVcfCacrT3FmOHmJa0-FS6ElUGAqAwle_-N7eSTfML5Fq43u84KrnGp6SDnmzocYogC9GNI6IZvmL_S75Q-fUKT3sp4MTEP68HRfhR2Tn5gE-SfyXZXkXhfkRNi0Pvtz0CGH5_No4fULGwrr6owP_MA7lLHVGuH5GoiyHLS13A0ZZenc_5xx5vyfkkwg74PJ86d7VImKOoXMul0N9BrNHPTVHS_Yjn5ALOGWRTRl9qpojh-07UrQd203S4PP4YHmvrLA1OINfhAv9KDPiTuSmoJR-t3jTODI2FnMAVESqJYwI6vrli7tzdGwcBSVD3iszhOFakdzR2thS6sjMn6MwKaojc6tgP-QdvL4xLvpX0npPa6b8dlo';
const SHOP_ID = '14022490';

async function testPrintifyAPI() {
  try {
    console.log('Testing Printify API...\n');
    
    // Test products endpoint
    const response = await fetch(`https://api.printify.com/v1/shops/${SHOP_ID}/products.json`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      }
    });
    
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response OK:', response.ok);
    console.log('Number of products:', data.data ? data.data.length : 0);
    
    if (data.data && data.data.length > 0) {
      console.log('\nFirst product:');
      console.log('- ID:', data.data[0].id);
      console.log('- Title:', data.data[0].title);
      console.log('- Visible:', data.data[0].visible);
      console.log('- Enabled:', data.data[0].is_enabled);
    } else {
      console.log('\nNo products found in the shop.');
      console.log('Full response:', JSON.stringify(data, null, 2));
    }
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testPrintifyAPI();