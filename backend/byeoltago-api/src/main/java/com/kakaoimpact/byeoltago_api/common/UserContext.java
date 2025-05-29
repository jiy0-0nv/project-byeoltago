package com.kakaoimpact.byeoltago_api.common;

public class UserContext {
    private static final ThreadLocal<String> userThreadLocal = new ThreadLocal<>();
    public static void setUserId(String userId) { userThreadLocal.set(userId); }
    public static String getUserId() { return userThreadLocal.get(); }
    public static void clear() { userThreadLocal.remove(); }
}
