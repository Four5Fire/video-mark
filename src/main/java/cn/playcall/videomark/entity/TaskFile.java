package cn.playcall.videomark.entity;

public class TaskFile {
    private String id;
    private int isbad;
    private String fileName;
    private int checkStatus;
    private String resultTxt;
    private String resultExport;
    private String backReason;
    private String cdnAddress;

    public TaskFile(Object id, Object isbad, Object fileName, Object checkStatus, Object resultTxt, Object resultExport, Object backReason, Object cdnAddress) {
        this.id = (String) id;
        if (isbad != null)
            this.isbad = (int) isbad;
        this.fileName = (String) fileName;
        this.checkStatus = (int) checkStatus;
        if (resultTxt != null)
            this.resultTxt = (String) resultTxt;
        if (resultExport != null)
            this.resultExport = (String) resultExport;
        if (backReason != null)
            this.backReason = (String) backReason;
        this.cdnAddress = (String) cdnAddress;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public int getIsbad() {
        return isbad;
    }

    public void setIsbad(int isbad) {
        this.isbad = isbad;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public int getCheckStatus() {
        return checkStatus;
    }

    public void setCheckStatus(int checkStatus) {
        this.checkStatus = checkStatus;
    }

    public String getResultTxt() {
        return resultTxt;
    }

    public void setResultTxt(String resultTxt) {
        this.resultTxt = resultTxt;
    }

    public String getResultExport() {
        return resultExport;
    }

    public void setResultExport(String resultExport) {
        this.resultExport = resultExport;
    }

    public String getBackReason() {
        return backReason;
    }

    public void setBackReason(String backReason) {
        this.backReason = backReason;
    }

    public String getCdnAddress() {
        return cdnAddress;
    }

    public void setCdnAddress(String cdnAddress) {
        this.cdnAddress = cdnAddress;
    }

    @Override
    public String toString() {
        return "TaskFile{" +
                "id='" + id + '\'' +
                ", isbad=" + isbad +
                ", fileName='" + fileName + '\'' +
                ", checkStatus=" + checkStatus +
                ", resultTxt='" + resultTxt + '\'' +
                ", resultExport='" + resultExport + '\'' +
                ", backReason='" + backReason + '\'' +
                ", cdnAddress='" + cdnAddress + '\'' +
                '}';
    }
}
