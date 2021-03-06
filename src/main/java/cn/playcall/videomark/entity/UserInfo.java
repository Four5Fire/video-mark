package cn.playcall.videomark.entity;

import java.util.ArrayList;

public class UserInfo {
    private String type;
    private String uid;
    private String taskid;
    private int pageSize;
    private int pageIndex;


    public String getType() {
        return type;
    }

    private int total;
    private String markRules;
    private ArrayList<TaskFile> fileList = new ArrayList<TaskFile>();

    public UserInfo(String uid, String taskid, String type) {
        this.uid = uid;
        this.taskid = taskid;
        this.type = type;
    }

    public String getUid() {
        return uid;
    }

    public void setUid(String uid) {
        this.uid = uid;
    }

    public String getTaskid() {
        return taskid;
    }

    public void setTaskid(String taskid) {
        this.taskid = taskid;
    }

    public int getPageSize() {
        return pageSize;
    }

    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
    }

    public int getPageIndex() {
        return pageIndex;
    }

    public void setPageIndex(int pageIndex) {
        this.pageIndex = pageIndex;
    }

    public int getTotal() {
        return total;
    }

    public void setTotal(Integer total) {
        this.total = total.intValue();
    }

    public String getMarkRules() {
        return markRules;
    }

    public void setMarkRules(String markRules) {
        this.markRules = markRules;
    }

    public ArrayList<TaskFile> getFileList() {
        return fileList;
    }

    public void addFile(TaskFile taskFile){
        fileList.add(taskFile);
    }

    public TaskFile getFile(String id){
        for (TaskFile file:fileList) {
            if (file.getId().equals(id)){
                return file;
            }
        }
        return null;
    }

    public void setFileListIsbad(String fileId,int isbad){
        for (int i = 0; i < fileList.size(); i++) {
            if (fileList.get(i).getId().equals(fileId)){
                TaskFile taskFile= fileList.get(i);
                taskFile.setIsbad(isbad);
                fileList.set(i,taskFile);
                break;
            }
        }
    }

    @Override
    public String toString() {
        return "UserInfo{" +
                "type='" + type + '\'' +
                ", uid='" + uid + '\'' +
                ", taskid='" + taskid + '\'' +
                ", pageSize=" + pageSize +
                ", pageIndex=" + pageIndex +
                ", total=" + total +
                ", markRules='" + markRules + '\'' +
                ", fileList=" + fileList +
                '}';
    }
}
