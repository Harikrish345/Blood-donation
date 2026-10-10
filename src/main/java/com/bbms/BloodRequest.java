package com.bbms;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="blood_requests")
public class BloodRequest {
  @Id
  @GeneratedValue(strategy=GenerationType.IDENTITY)
  private Long id;

  private String patientName;
  private String bloodGroup;
  private String hospital;
  private String status;
  private int units;
  private LocalDateTime requestedAt = LocalDateTime.now();

  protected BloodRequest() {}

  public BloodRequest(String p, String b, String h, int u) {
    patientName = p;
    bloodGroup = b;
    hospital = h;
    units = u;
    status = "PENDING";
  }

  public Long getId() { return id; }
  public String getPatientName() { return patientName; }
  public String getBloodGroup() { return bloodGroup; }
  public String getHospital() { return hospital; }
  public int getUnits() { return units; }
  public String getStatus() { return status; }
  public LocalDateTime getRequestedAt() { return requestedAt; }
  public void setStatus(String s) { status = s; }
}
