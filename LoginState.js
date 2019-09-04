class LoginState {
    async setUpAuth() {        
        console.log("get containers");
        let container = CloudKit.getDefaultContainer();      
        let userInfo = await container.setUpAuth();
        if(userInfo) {
            this.gotoAuthenticatedState(userInfo);       
            return true;     
        } else {
            this.gotoUnauthenticatedState();
            return false;
        }

    
    }
    gotoAuthenticatedState(userInfo) {
        let container = CloudKit.getDefaultContainer();   
        document.getElementById("ForLoggedIn").style.display = "block";
        container.whenUserSignsOut().then(this.gotoUnauthenticatedState);
    };
    
    gotoUnauthenticatedState(error) {
        let container = CloudKit.getDefaultContainer();   
        document.getElementById("ForLoggedIn").style.display = "none";
        container
        .whenUserSignsIn()
        .then(this.gotoAuthenticatedState)
        .catch(this.gotoUnauthenticatedState);
      };
}