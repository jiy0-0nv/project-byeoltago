# [별타고 Byeoltago]
 ## 📌 Overview
 2025 Spring 테크포임팩트 프로젝트
 <p align="center">
<img width="420px" alt="별타고 로고" src="./frontend/imgs/logo.png" /><br>
<b>안전한 자전거 주행을 위한 서비스</b><br>
<a href="https://jiy0-0nv.github.io/project-byeoltago/frontend/">⭐ 별타고 사이트 바로가기</a><br>
<a href="https://www.youtube.com/watch?v=rei5sjYEuGY">🚴🏻 별타고 프로모션 영상</a>

---
## 🧑‍🤝‍🧑 Roles 
 | 이름   | 역할     |
| ------ | -------- |
| 장선아 | PM       | 
| 정지윤 | Fullstack   | 
| 권도현 | Frontend | 
| 박소현 | 기획, 디자인  |
| 김현중 | UI 디자인 총괄   | 

## 🎓 Advisors
- **Fellow**: 김경목 펠로우님 (별따러가자)
- **Mentor**: 민경훈 멘토님 (카카오모빌리티)

## 🎯Goal 
 **별타고** 는 도심 속 자전거와 킥보드 사용자의 안전을 도모합니다. 

## ⚙️ 주요 기능 (Key Features)
- **사용자 인증**(로그인, 회원가입) : JWT 쿠키 기반 인증, 로그인 후 상태 유지, API 호출 시 로그인 검증
- **도로 신고** : 사용자 환경 기반으로 GPS와 시간 정보 수집, 위험 유형 선택
- **주행 중 신고** : 현재 위치와 시간 정보 캐싱, 주행 종료 후 polyline 제공, 다중 신고 제출
- **마커 조회** : 기존 신고 내역을 지도상 마커로 표시, 횟수 및 유형에 따라 다른 마커 디자인, 클릭 시 상세 정보 확인 가능

| <span style="font-size: 11px;">로그인 화면</span>  | <span style="font-size: 11px;">회원가입 화면</span> | <span style="font-size: 11px;">지도 홈 화면</span> | <span style="font-size: 11px;">주행 중 화면</span> | <span style="font-size: 11px;">신고하기 화면</span> | <span style="font-size: 11px;">유형 선택 화면</span> |
|------------|--------------|--------------|--------------|--------------|--------------|
| <img src="https://sunset-cross-5c6.notion.site/image/attachment%3Afd5b98fb-3d1b-4e20-bcc9-e3276173275b%3A%EC%8A%A4%ED%81%AC%EB%A6%B0%EC%83%B7_2025-06-24_221749.png?table=block&id=21df0a45-4b12-80c5-a98c-ff4bbdd05808&spaceId=b32cad9e-5198-45a7-abbc-149012173af2&width=1030&userId=&cache=v2"> | <img src="https://sunset-cross-5c6.notion.site/image/attachment%3A7ee01ae5-b556-4002-af9a-6739e52391a4%3A%EC%8A%A4%ED%81%AC%EB%A6%B0%EC%83%B7_2025-06-24_221758.png?table=block&id=21df0a45-4b12-808f-b49e-db6a2dd57987&spaceId=b32cad9e-5198-45a7-abbc-149012173af2&width=1030&userId=&cache=v2"> |<img src="https://sunset-cross-5c6.notion.site/image/attachment%3A62a7314e-9e96-4682-a7ef-716601f8799a%3A%EC%8A%A4%ED%81%AC%EB%A6%B0%EC%83%B7_2025-06-24_221819.png?table=block&id=21df0a45-4b12-80a7-9fda-cefd4c9e3711&spaceId=b32cad9e-5198-45a7-abbc-149012173af2&width=1030&userId=&cache=v2"> |<img src="https://sunset-cross-5c6.notion.site/image/attachment%3A4ff9bc9d-51b5-43cb-9da6-01c97b72fd1e%3A%EC%8A%A4%ED%81%AC%EB%A6%B0%EC%83%B7_2025-06-24_221844.png?table=block&id=21df0a45-4b12-80b0-b282-ff0de6c27ba9&spaceId=b32cad9e-5198-45a7-abbc-149012173af2&width=1030&userId=&cache=v2"> |<img src="https://sunset-cross-5c6.notion.site/image/attachment%3Ae0e4bb51-caeb-462c-81d2-cd8267b30d1e%3A%EC%8A%A4%ED%81%AC%EB%A6%B0%EC%83%B7_2025-06-24_221904.png?table=block&id=21df0a45-4b12-80d3-a6d5-f349602f4c8e&spaceId=b32cad9e-5198-45a7-abbc-149012173af2&width=1030&userId=&cache=v2"> |<img src="https://sunset-cross-5c6.notion.site/image/attachment%3A73894fb4-cddc-4b25-b2bd-ca5b4c28b728%3A%EC%8A%A4%ED%81%AC%EB%A6%B0%EC%83%B7_2025-06-24_221914.png?table=block&id=21df0a45-4b12-8082-9da0-dbb956c20510&spaceId=b32cad9e-5198-45a7-abbc-149012173af2&width=1030&userId=&cache=v2"> |

## 🛠 Architecture
<img width="600px" src="https://github.com/user-attachments/assets/69376629-0420-4575-9de3-a1f5ac3aa159">

| Category   | Stack / Tool |
|------------|--------------|
| **Frontend** | HTML+CSS, Javascript  |
| **Backend** | Spring Boot |
| **Deployment** | Github, AWS, Docker|


## 💡 Potential Plans 
- 자전거 커뮤니티로 확장함으로써 더 많은 유저와 데이터 확보 목표 
- 네비게이션 기능 탑재 & 실시간 위험 구간 음성 안내
