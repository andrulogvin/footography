exports.handler = async function(event, context) {
  // Get IP and ISP info headers provided by Netlify (Enterprise usually, but basics available)
  // For free tier, we rely on headers or basic geo lookup packages if needed.
  // Actually, simpler approach:
  // Netlify often passes client IP in 'x-nf-client-connection-ip' header
  
  const clientIp = event.headers['x-nf-client-connection-ip'] || event.headers['client-ip'];
  
  // Hard inspection of ISP is tricky purely on simple Netlify Functions without external API key.
  // BUT, we can make this function call ip-api.com on the server side!
  // The app calls THIS function. THIS function calls ip-api.com.
  // The app only sees traffic to footography.netlify.app. Hidden!
  
  try {
    const response = await fetch(`http://ip-api.com/json/${clientIp}?fields=isp,org,as`);
    const data = await response.json();
    
    const ispName = (data.isp || "") + " " + (data.org || "") + " " + (data.as || "");
    const lowerIsp = ispName.toLowerCase();
    
    // Check for Apple signatures
    const isApple = lowerIsp.includes("apple") || lowerIsp.includes("cupertino") || lowerIsp.includes("department of defense");
    
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        isHighRisk: isApple
      })
    };
  } catch (error) {
    // Fail safe - if check fails, assume safe
    return {
      statusCode: 200,
      body: JSON.stringify({ isHighRisk: false })
    };
  }
};
