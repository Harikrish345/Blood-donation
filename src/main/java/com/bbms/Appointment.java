package com.bbms;
import jakarta.persistence.*; import java.time.LocalDateTime;
@Entity public class Appointment {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 private String donorName,email,location,status; private LocalDateTime appointmentTime;
 protected Appointment(){} public Appointment(String n,String e,LocalDateTime t,String l){donorName=n;email=e;appointmentTime=t;location=l;status="BOOKED";}
 public Long getId(){return id;} public String getDonorName(){return donorName;} public String getEmail(){return email;} public LocalDateTime getAppointmentTime(){return appointmentTime;} public String getLocation(){return location;} public String getStatus(){return status;} public void setStatus(String s){status=s;}
}
