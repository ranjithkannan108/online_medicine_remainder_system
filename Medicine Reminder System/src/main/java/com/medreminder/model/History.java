package com.medreminder.model;

public class History {
    private int id;
    private int userId;
    private int medicineId;
    private String medicineName;
    private String dosage;
    private String actionType;
    private String takenAt;

    public History() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public int getMedicineId() { return medicineId; }
    public void setMedicineId(int medicineId) { this.medicineId = medicineId; }

    public String getMedicineName() { return medicineName; }
    public void setMedicineName(String medicineName) { this.medicineName = medicineName; }

    public String getDosage() { return dosage; }
    public void setDosage(String dosage) { this.dosage = dosage; }

    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }

    public String getTakenAt() { return takenAt; }
    public void setTakenAt(String takenAt) { this.takenAt = takenAt; }
}
