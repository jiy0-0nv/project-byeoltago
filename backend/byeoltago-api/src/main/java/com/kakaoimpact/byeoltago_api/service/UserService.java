package com.kakaoimpact.byeoltago_api.service;

import com.kakaoimpact.byeoltago_api.model.User;
import com.kakaoimpact.byeoltago_api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;


    public Boolean login(String email){
        User user =  userRepository.findUserByEmail(email);
        user.setPoints(100);
        userRepository.save(user);
        return user.getEmail().equals("kyunghoon451@gmail.com");
    }


}
