package com.kakaoimpact.byeoltago_api.repository;

import com.kakaoimpact.byeoltago_api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    public User findUserByEmail(String email);
    public User findUserByNicknameAndEmail(String nickname, String email);

}
