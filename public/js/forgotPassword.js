async function forgotPassword() {
    const userId=localStorage.getItem("userId");
    const email=document.getElementById("email");
    const data={userId:userId,email:email.value}
    await axios.post("http://54.253.5.172:3000/forgot-password",data).then(res=>{
        alert("A reset password email has been sent to your registered email")
        console.log(res)
        email.value=""
    })
}