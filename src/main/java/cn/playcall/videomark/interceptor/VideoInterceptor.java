package cn.playcall.videomark.interceptor;

import cn.playcall.videomark.entity.UserInfo;
import cn.playcall.videomark.server.HttpClient;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

public class VideoInterceptor extends HandlerInterceptorAdapter {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        HttpSession session = request.getSession(false);
        if (session == null){
            System.out.println("Illegal user login");
            return false;
        }else {
            UserInfo userInfo = (UserInfo) session.getAttribute("userInfo");
            if (HttpClient.getTaskFiles(userInfo)){
                session.setAttribute("userInfo",userInfo);
                System.out.println("信息更新成功");
            }
        }
        return true;
    }
}
