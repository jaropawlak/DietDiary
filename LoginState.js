class LoginState {
    async setUpAuth() {        
        console.log("get containers");
        let container = CloudKit.getDefaultContainer();      
        let userInfo = await container.setUpAuth();
        container.whenUserSignsOut().then(this.gotoUnauthenticatedState);
        container.whenUserSignsIn().then(this.gotoAuthenticatedState).catch(this.gotoUnauthenticatedState);
        if(userInfo) {
            this.gotoAuthenticatedState(userInfo);       
            return true;     
        } else {
            this.gotoUnauthenticatedState();
            return false;
        }

    
    }
    gotoAuthenticatedState (userInfo) {
        document.getElementById("ForLoggedIn").style.display = "block";
        document.getElementById("login-info").style.display = "none";
    };
    
    gotoUnauthenticatedState(error) {
        document.getElementById("ForLoggedIn").style.display = "none";
        document.getElementById("login-info").style.display = "block";
      };
}