package cn.playcall.videomark.interceptor;

import cn.playcall.videomark.entity.UserInfo;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

public class ResultInterceptor extends HandlerInterceptorAdapter {
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        System.out.println("执行Result Interceptor");
        HttpSession session = request.getSession(false);
        if (session == null){
            System.out.println("user no session");
            return false;
        }
        UserInfo userInfo = (UserInfo) session.getAttribute("userInfo");
        if (userInfo.getType().equals("mark")){
            return true;
        }
        else{
            return false;
        }

    }
}
