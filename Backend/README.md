Using the Backend Routes:

When you create a backend file (ie. auth.js), use "exports.name" to define a function (ie. exports.login, etc). These functions are then exported as modules to direct requests towards. You can define any number of modules in a single backend file. KEEP THESE ORGANIZED BY PURPOSE AND GENERAL FUNCTION (ie. everything with authorization/logging in is in auth.js)

To create a new route, put it into "routes.js":
1. Ensure the file itself is required in the 'Requires' section if it is not already

2. Define the route using format "router.*method*('*/route_name*, *endpoint*). 

Method = what you are doing (ie. GET, POST, etc)

/route_name = whatever your FRONTEND .js file calls it. For example, login.js does 'await fetch('api/login')...' with the method of 'POST'. It therefore is looking for "router.post('/login')" to tell it where to go. 

/api is the PATH TO ROUTES.JS (defined in index.js). EVERYTHING ROUTED will therefore be "/api/*route_path*"

3. You can stack routes together. The MOST IMPORTANT ONE IS GETTING USER ID:

**Currently** - user_id is held in localStorage as jwt. This is basically a really complicated and stupid cookie. 'Auth.js' has a module called 'verify' that decodes the jwt and gives the 'user_id' to whatever comes next.

If you have a page/function/anything that needs to use the current user's id, do the following:

1. The Frontend .js file (whatever you wrote) does a request to the Backend. The HEADER needs to contain the JWT with the Header type of ['authorization'] and Label of 'Bearer'. Format example:

const response = await fetch('/api/*route_name*', {
method: '*method*', //this can be POST, GET, etc
headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('token');
    'Body': '*anything else you are sending*' //this line is optional
}
});

2. The route in 'routes.js' will be defined as:

router.*method*(/*route_name*, auth.verify, *your_backendfile.your_module*)

3. In your Backend file (whatever you write), you have a function (exported as a module as indicated above) that contains:

const user_id = req.user_id

Congrats. You can now use the variable 'user_id' or whatever you want to call it to do stuff.

4. When you are done, do res.json{ *your final variable* } and your FrontEnd .js will see the incoming json and be able to do stuff with it (Example HOW you implement this depends on your unique code. Sorry, this is massively oversimplified)

**For those curious about how verify, module stacking works:**
When you stack the router in step 2 above, the stuff you send (req) is passed to auth.verify first. It's first line grabs 'req.headers['Authorization']', which is where you put the JWT in step 1 above. Verify then grabs only the JWT and reads it. If there are no errors, the last line is 'res.user_id = decoded.user_id', which takes out the 'user_id' component and returns it. The router then automatically shuttles that along to the next module in line (whatever you defined in step 2). Your backend module then sees the incoming info and you use 'req.user_id' to grab the user_id for your use.

It is possible (I think) to stack AS MANY MODULES AS YOU WANT in this way, as long as they don't break

**KNOWN POSSIBLE ERRORS/ISSUES**
If these happen, yell at me. Some of these I might need to decode
- browser gives a 'path error' = your route wasn't properly defined
- Error 401 from Verify = it doesn't see an 'Authorization' header
- Error 403 from Verify = your JWT doesn't work (bad read, invalid, etc)
- user_id isn't being sent along to next module = check that everything is structured right, and then I'll double check router documentation.
- JSON parse error for JWT (happens on login) = this ones... I need to look into this. It doesn't always happen, but I need to deal with it PROPERLY
- anything else = no idea!