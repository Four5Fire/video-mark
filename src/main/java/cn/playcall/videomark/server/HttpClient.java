package cn.playcall.videomark.server;

import cn.playcall.videomark.entity.TaskFile;
import cn.playcall.videomark.entity.UserInfo;
import cn.playcall.videomark.interceptor.IndexInterceptor;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.util.DigestUtils;
import org.springframework.web.client.RestTemplate;

import java.io.*;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.Map;

public class HttpClient {

    private static String appid = "";
    private static String appkey = "";
    public static String username = "";
    public static String password = "";
    private static String q_taskfile_api = "";
    private static String s_result_api = "";
    private static String check_api = "";

    public static void apiConfiguration(){
        try {
            BufferedReader brConfigData = new BufferedReader(new FileReader("config/config.json"));
            String jsonData = null;
            String content = "";
            while ((jsonData = brConfigData.readLine())!=null){
                content += jsonData;
            }
            brConfigData.close();
            JSONObject jsonObject = JSONObject.parseObject(content);
            appid = jsonObject.getString("appid");
            appkey = jsonObject.getString("appkey");
            username = jsonObject.getString("username");
            password = jsonObject.getString("password");
            q_taskfile_api = jsonObject.getString("q_taskfile_api");
            s_result_api = jsonObject.getString("s_result_api");
            check_api = jsonObject.getString("check_api");
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static boolean getTaskFiles(UserInfo userInfo) {
        long uTime = System.currentTimeMillis();
        int salt = (int)((Math.random()*9+1)*100000);
        String token = HttpClient.getToken(uTime,salt);
        HttpHeaders headers = new HttpHeaders();
        headers.add("appid",appid);
        headers.add("token",token);
        headers.add("time", String.valueOf(uTime));
        headers.add("salt", String.valueOf(salt));

        String uid = userInfo.getUid();
        String taskid = userInfo.getTaskid();
        JSONObject postData = new JSONObject();
        postData.put("uid", uid);
        postData.put("taskid", taskid);
        postData.put("pagesize","20");
        postData.put("pageindex","1");
        HttpEntity<JSONObject> httpEntity = new HttpEntity<>(postData,headers);
        RestTemplate restTemplate = new RestTemplate();
        String result = restTemplate.postForEntity(q_taskfile_api, httpEntity, String.class).getBody();
        JSONObject postResult = JSONObject.parseObject(result);
//        postResult = jsonAlterNullToEmpty(postResult);

        String code = (String) postResult.get("code");
        String mark_rules = (String) postResult.get("mark_rules");
        userInfo.setMarkRules(mark_rules);
        JSONArray fileArray = postResult.getJSONArray("taskFiles");
        for (int i = 0; i < fileArray.size(); i++) {
            JSONObject jsonFile = fileArray.getJSONObject(i);
            userInfo.addFile(new TaskFile(jsonFile.get("id"), jsonFile.get("isbad"),
                    jsonFile.get("fileName"), jsonFile.get("checkStatus"),
                    jsonFile.get("result_txt"),
                    jsonFile.get("result_export"),
                    jsonFile.get("back_reason"),
                    jsonFile.get("cdn_address")));
        }
        if (!code.equals("000000"))
            return false;
        return true;
    }

    public static JSONObject postResult(String uid, String fileId, String result,String isBad){
        long uTime = System.currentTimeMillis();
        int salt = (int)((Math.random()*9+1)*100000);
        String token = HttpClient.getToken(uTime,salt);

        HttpHeaders headers = new HttpHeaders();
        headers.add("appid",appid);
        headers.add("token",token);
        headers.add("time", String.valueOf(uTime));
        headers.add("salt", String.valueOf(salt));
        JSONObject postData = new JSONObject();
        postData.put("result_txt",result);
        postData.put("result_export", result);
//        postData.put("export_name","");
        postData.put("isbad",isBad);
        postData.put("uid",uid);
        postData.put("file_id",fileId);
        postData.put("back_reason","");
        postData.put("checkStatus",0);
        System.out.println(postData);
        HttpEntity<JSONObject> httpEntity = new HttpEntity<>(postData,headers);
        RestTemplate restTemplate = new RestTemplate();
        JSONObject postResult = new JSONObject();
        System.out.println(headers);
        try{
            postResult = restTemplate.postForEntity(s_result_api, httpEntity, JSONObject.class).getBody();
            System.out.println(postResult);
        }finally {
            return postResult;
        }
    }

    private static String getToken(long uTime, int salt){
        String info = appid+appkey+String.valueOf(salt)+String.valueOf(uTime);
        String token = DigestUtils.md5DigestAsHex(info.getBytes());
        return token;
    }

    public static JSONObject postCheckResult(JSONObject postData){
        long uTime = System.currentTimeMillis();
        int salt = (int)((Math.random()*9+1)*100000);
        String token = HttpClient.getToken(uTime,salt);

        HttpHeaders headers = new HttpHeaders();
        headers.add("appid",appid);
        headers.add("token",token);
        headers.add("time", String.valueOf(uTime));
        headers.add("salt", String.valueOf(salt));

        HttpEntity<JSONObject> httpEntity = new HttpEntity<>(postData,headers);
        RestTemplate restTemplate = new RestTemplate();
        JSONObject postResult = restTemplate.postForEntity(check_api, httpEntity, JSONObject.class).getBody();
        return postResult;
    }

    public static JSONObject jsonAlterNullToEmpty(JSONObject jsonObject){
        Iterator<String> iterator = jsonObject.keySet().iterator();
        Object object = null;
        String key = null;
        while (iterator.hasNext()){
            key = iterator.next();
            object = jsonObject.get(key);
            if (object instanceof JSONArray){
                JSONArray objectArr = (JSONArray) object;
                for (int i = 0; i < objectArr.size(); i++) {
                    objectArr.set(i,jsonAlterNullToEmpty((JSONObject)objectArr.getJSONObject(i)));
                }
            }
            if (object instanceof JSONObject){
                object = jsonAlterNullToEmpty((JSONObject) object);
            }
            if (object == null){
                jsonObject.put(key,"");
            }
        }
        return jsonObject;
    }

}
