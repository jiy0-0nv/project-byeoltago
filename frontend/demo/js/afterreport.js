// 뒤로가기
document.querySelector(".back-btn").addEventListener("click", () => {
  history.back();
});

// 사진 업로드 이벤트
document.getElementById("photo-input").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    alert("사진이 선택되었습니다.");
  }
});

// 장소변경 버튼
document.querySelector(".location-change-btn").addEventListener("click", () => {
  alert("장소 변경 기능은 추후 구현 예정입니다.");
});

// 뒤로가기 버튼
document.querySelector(".back-btn").addEventListener("click", () => {
  history.back();
});

// 요소 선택
const textarea = document.querySelector(".description-box textarea");
const submitBtn = document.querySelector(".submit-btn");

// 텍스트 입력 감지
textarea.addEventListener("input", (e) => {
  const hasText = e.target.value.trim().length > 0;

  if (hasText) {
    submitBtn.disabled = false;
    submitBtn.style.backgroundColor = "#efc327"; // 활성화 시 노란색
    submitBtn.style.cursor = "pointer";
  } else {
    submitBtn.disabled = true;
    submitBtn.style.backgroundColor = "#ddd"; // 비활성화 시 회색
    submitBtn.style.cursor = "not-allowed";
  }
});

// 클릭 시 동작
submitBtn.addEventListener("click", () => {
  if (!submitBtn.disabled) {
    alert("신고가 접수되었습니다!");
  }
});