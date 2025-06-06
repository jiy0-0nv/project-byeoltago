package com.kakaoimpact.byeoltago_api.component;

import com.kakaoimpact.byeoltago_api.common.Coordinates;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Component
public class RedisComponent {

    private final RedisTemplate<String, Object> userCoordinatesRedisTemplate;
    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    @Autowired
    public RedisComponent(RedisTemplate<String, Object> userCoordinatesRedisTemplate) {
        this.userCoordinatesRedisTemplate = userCoordinatesRedisTemplate;
    }

    /**
     * 사용자 ID를 키로, 현재 시간을 해시 키로, 좌표를 해시 값으로 저장합니다.
     * 이 메서드는 다음 두 가지 경우 모두에 사용할 수 있습니다:
     * 1. 키(user_id)가 아직 존재하지 않는 경우: 새로운 해시를 생성합니다.
     * 2. 키(user_id)가 이미 존재하는 경우: 새로운 해시 키(timestamp)로 항목을 추가합니다.
     * 
     * @param userId 사용자 ID
     * @param coordinates 좌표 객체
     * @return 생성된 타임스탬프
     */
    public String setUserCoordinate(String userId, Coordinates coordinates) {
        String timestamp = getCurrentTimestamp();
        userCoordinatesRedisTemplate.opsForHash().put(userId, timestamp, coordinates);
        return timestamp;
    }

    /**
     * 사용자 ID에 해당하는 모든 좌표 데이터를 삭제합니다.
     *
     * @param userId 사용자 ID
     * @return 삭제 성공 여부
     */
    public Boolean deleteAllUserCoordinates(String userId) {
        return userCoordinatesRedisTemplate.delete(userId);
    }

    /**
     * 사용자 ID에 해당하는 키를 Redis에서 삭제합니다.
     * 이 메서드는 해당 사용자의 모든 좌표 데이터를 삭제합니다.
     *
     * @param userId 사용자 ID
     * @return 삭제 성공 여부
     */
    public Boolean deleteUserKey(String userId) {
        return userCoordinatesRedisTemplate.delete(userId);
    }

    /**
     * 사용자 ID와 타임스탬프를 기반으로 해시 엔트리를 삭제합니다.
     * 
     * @param userId 사용자 ID
     * @param timestamp 타임스탬프
     * @return 삭제된 항목 수
     */
    public Long deleteUserCoordinate(String userId, String timestamp) {
        return userCoordinatesRedisTemplate.opsForHash().delete(userId, timestamp);
    }

    /**
     * 사용자 ID와 타임스탬프를 기반으로 해시 키가 존재하는지 확인합니다.
     * 
     * @param userId 사용자 ID
     * @param timestamp 타임스탬프
     * @return 해시 키 존재 여부
     */
    public Boolean hasUserCoordinate(String userId, String timestamp) {
        return userCoordinatesRedisTemplate.opsForHash().hasKey(userId, timestamp);
    }

    /**
     * 현재 시간을 yyyyMMddHHmmss 형식의 문자열로 반환합니다.
     * 
     * @return 현재 시간 문자열
     */
    private String getCurrentTimestamp() {
        LocalDateTime now = LocalDateTime.now();
        return now.format(formatter);
    }

    /**
     * 사용자 ID와 타임스탬프를 기반으로 좌표를 조회합니다.
     * 
     * @param userId 사용자 ID
     * @param timestamp 타임스탬프
     * @return 좌표 객체, 없으면 null
     */
    public Coordinates getUserCoordinate(String userId, String timestamp) {
        return (Coordinates) userCoordinatesRedisTemplate.opsForHash().get(userId, timestamp);
    }

    /**
     * 사용자 ID에 해당하는 모든 타임스탬프와 좌표를 조회합니다.
     * 
     * @param userId 사용자 ID
     * @return 타임스탬프와 좌표의 맵
     */
    public java.util.Map<Object, Object> getAllUserCoordinates(String userId) {
        return userCoordinatesRedisTemplate.opsForHash().entries(userId);
    }

    
}
