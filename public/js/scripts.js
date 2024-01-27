function validateForm(name,email,password,confirmPassword) {
    document.getElementById('errorMessages').innerHTML = '';
    if (name.trim() === '' || email.trim() === '' || password.trim() === '' || confirmPassword.trim() === '') {
        document.getElementById('errorMessages').innerHTML = 'All fields are required.';
        return false;
    }
    if (password !== confirmPassword) {
        document.getElementById('errorMessages').innerHTML = 'Passwords do not match.';
        return false;
    }
    return true;
}

async function signUpData(){
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');

    if(validateForm(name.value,email.value,password.value,confirmPassword.value)){
        const data={name:name.value,email:email.value,password:password.value}
        await axios.post("http://54.253.5.172:3000/user-signup",data).then(res=>{
            if(res.data.message){
                document.getElementById("errorMessages").innerText=res.data.message;
            }
            else {
                name.value="";
                email.value="";
                password.value="";
                confirmPassword.value="";
                alert("User created successfully")
            }
        })
    }
}
function resetPassword(){
    window.location.href="../html/forgotPassword.html"
}
async function login(){
    const errMessage=document.getElementById("loginErrorMessages");
    const email=document.getElementById("loginEmail");
    const password=document.getElementById("loginPassword");
    const data={email:email.value,password:password.value};
    await axios.post("http://54.253.5.172:3000/user-login",data).then((res)=>{
        errMessage.innerText="";
        window.location.href="../html/expense.html"
        localStorage.setItem("userId",res.data.id);
        localStorage.setItem("isPremiumUser",res.data.isPremiumUser)
        email.value="";
        password.value=""
    }).catch(err=>{
        if(err.request.status===401){
            errMessage.innerText=err.response.data;
        }
        else if(err.request.status===404){
            errMessage.innerText=err.response.data;
        }
    })
}
