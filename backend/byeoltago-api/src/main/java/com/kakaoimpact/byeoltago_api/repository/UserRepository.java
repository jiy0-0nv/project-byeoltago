package com.kakaoimpact.byeoltago_api.repository;

import com.kakaoimpact.byeoltago_api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findUserByEmail(String email); // 반환 타입을 Optional<User>로 권장    public User findUserByNicknameAndEmail(String nickname, String email);
    Optional<User> findByNickname(String nickname); // 닉네임으로 사용자 찾는 메서드 추가
    Optional<User> findByPhoneNumber(String phoneNumber); // 핸드폰 번호로 사용자 찾는 메서드 추가
}
