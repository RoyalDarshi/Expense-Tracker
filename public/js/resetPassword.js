async function resetPassword() {
    const pass=document.getElementById("password");
    const confPass=document.getElementById("confirmPassword");
    if(pass.value!==confPass.value){
        const errMsg=document.getElementById("errorMsg");
        errMsg.innerText="Password doesn't match";
    }
    else{
        const userId=localStorage.getItem("userId");
        const data={userId:userId,password:pass.value};
        await axios.post("http://54.253.5.172:3000/reset-password",data).then(res=>{
            if(res.data.msg){
                alert(res.data.msg)
                window.location.href="../html/login.html";
            }
        })
    }
}