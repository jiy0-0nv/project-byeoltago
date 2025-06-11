function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
        alert("이메일과 비밀번호를 입력해주세요.");
        return;
    }

    fetch("http://43.203.245.224:8080/api/v1/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include", // 쿠키를 포함하여 요청
      body: JSON.stringify({ email, password })
    })
      .then(res => {
        if (!res.ok) throw new Error("로그인 실패");
        return res.json();
      })
      .then(data => {
        window.location.href = "mapdrive.html";    // 로그인 성공 시 이동
      })
      .catch(err => {
        console.error("Login failed:", err);
        alert("로그인 정보가 올바르지 않습니다.");
      });
  }