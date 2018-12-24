package cn.playcall.videomark.interceptor;

import cn.playcall.videomark.entity.UserInfo;
import cn.playcall.videomark.server.HttpClient;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;

public class IndexInterceptor extends HandlerInterceptorAdapter {

    private static String username = HttpClient.username;
    private static String password = HttpClient.password;

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,Object handler) throws IOException {
        String type = request.getParameter("type");
        String uid = request.getParameter("uid");
        String taskid = request.getParameter("taskid");
        String salt = request.getParameter("salt");
        String unixTime = request.getParameter("time");
        String token = request.getParameter("token");

        System.out.println(type);
        System.out.println(uid);
        System.out.println(taskid);
        System.out.println(salt);
        System.out.println(unixTime);
        System.out.println(token);

        if (uid.length()==0||taskid.length()==0||salt.length()==0||unixTime.length()==0||token.length()==0||type.length()==0){
            response.sendError(422);
            return false;
        }
        if (tokenPass(salt+ username +password+unixTime+salt,token)){
            UserInfo userInfo = new UserInfo(uid, taskid,type);
            HttpSession session = request.getSession();

            if (!HttpClient.getTaskFiles(userInfo)){
                response.sendError(500,"api q_taskfile error");
                return false;
            }
            session.setAttribute("userInfo",userInfo);

            return true;
        }

        else {
            response.sendError(401);
            return false;
        }
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
//        System.out.println("执行postHandle方法");
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
//        System.out.println("执行afterCompletion方法");
    }

    public boolean tokenPass(String info,String token){
        String tokenMD5 = DigestUtils.md5Hex(info);
        if (tokenMD5.equals(token)){
            return true;
        }
        return false;
    }


}
