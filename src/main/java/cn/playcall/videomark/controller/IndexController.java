package cn.playcall.videomark.controller;

import cn.playcall.videomark.entity.TaskFile;
import cn.playcall.videomark.entity.UserInfo;
import cn.playcall.videomark.server.HttpClient;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import org.springframework.http.*;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.io.IOException;

@CrossOrigin
@Controller
@RequestMapping(value = "/casia")
public class IndexController {

    @RequestMapping(value = "/index", method = RequestMethod.GET)
    public String taskFile(HttpServletRequest request,ModelMap map){
        HttpSession session = request.getSession();
        UserInfo userInfo = (UserInfo) session.getAttribute("userInfo");
        System.out.println(userInfo);
        map.addAttribute("fileList",userInfo.getFileList());
        map.addAttribute("mark_rules","标注规范："+userInfo.getMarkRules());
        if (userInfo.getType().equals("mark")){
            return "index_bz";
        }
        else if (userInfo.getType().equals("check")){
            return "index_jc";
        }
        return null;
    }

    @RequestMapping(value = "/video",method = RequestMethod.POST)
    public ResponseEntity<JSONObject> loadVideo(HttpServletRequest request,@RequestBody JSONObject data) throws IOException, InterruptedException {
        HttpSession session = request.getSession();
        UserInfo userInfo = (UserInfo) session.getAttribute("userInfo");
        String fileId = data.getString("fileId");
        session.setAttribute("fileId",fileId);
        String taskid = userInfo.getTaskid();
        TaskFile taskFile = userInfo.getFile(fileId);
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("taskid",taskid);
        jsonObject.put("fileName",taskFile.getFileName());
        jsonObject.put("cdnAddress",taskFile.getCdnAddress());
        jsonObject.put("checkStatus",taskFile.getCheckStatus());
        if (taskFile.getIsbad() != 1){
            jsonObject.put("isbad",0);
        }else {
            jsonObject.put("isbad",1);
        }
        if (taskFile.getResultExport() == null){
            jsonObject.put("markStatus",0);
        }else {
            jsonObject.put("markStatus",1);
        }
        jsonObject.put("backReason",taskFile.getBackReason());
        if (userInfo.getType().equals("check")){
            System.out.println(taskFile.getResultTxt());
            JSONObject jsonTaskResult = JSONObject.parseObject(taskFile.getResultTxt());
            JSONArray jsonArraySegaments = jsonTaskResult.getJSONArray("segaments");
            jsonObject.put("segaments",jsonArraySegaments);
            jsonObject.put("backReason",taskFile.getBackReason());
        }else if (userInfo.getType().equals("mark")){
            System.out.println("--------------------");
            if (taskFile.getResultTxt() == null){
                JSONArray jsonArray = new JSONArray();
                jsonObject.put("segaments",jsonArray);
            }else {
                JSONObject jsonObject1 = JSONObject.parseObject(taskFile.getResultTxt());
                JSONArray jsonArray = jsonObject1.getJSONArray("segaments");
                jsonObject.put("segaments",jsonArray);
            }
            System.out.println(jsonObject);
        }
        return new ResponseEntity<JSONObject>(jsonObject,HttpStatus.OK);
    }

    @RequestMapping(value = "/result",method = RequestMethod.POST)
    public ResponseEntity<JSONObject> receiveResult(HttpServletRequest request,@RequestBody JSONObject jsonObject){
        HttpSession session = request.getSession();
        UserInfo userInfo = (UserInfo) session.getAttribute("userInfo");
        String isbad = jsonObject.getString("isBad");
        jsonObject.remove("isBad");
        System.out.println(jsonObject);
        String resultContent = JSON.toJSONString(jsonObject);
        String uid = userInfo.getUid();
        String fileId = (String) session.getAttribute("fileId");
        JSONObject resultStatus = new JSONObject();
        resultStatus = HttpClient.postResult(uid,fileId,resultContent,isbad);
        System.out.println(resultStatus);
        return new ResponseEntity<JSONObject>(resultStatus,HttpStatus.OK);
    }

    @RequestMapping(value = "/check",method = RequestMethod.POST)
    public ResponseEntity<JSONObject> receiveCheckResult(HttpServletRequest request,@RequestBody JSONObject jsonObject){
        HttpSession session = request.getSession();
        UserInfo userInfo = (UserInfo) session.getAttribute("userInfo");
        jsonObject.put("uid",userInfo.getUid());
        JSONObject resultStatus = new JSONObject();
        resultStatus = HttpClient.postCheckResult(jsonObject);
        System.out.println(resultStatus);
        return new ResponseEntity<JSONObject>(resultStatus,HttpStatus.OK);
    }

}
