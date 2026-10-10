package com.bbms;
import jakarta.persistence.*;
import java.time.LocalDate;
@Entity public class Camp {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 private String name, location; private LocalDate date; private String organizer;
 protected Camp(){} public Camp(String n,String l,LocalDate d,String o){name=n;location=l;date=d;organizer=o;}
 public Long getId(){return id;} public String getName(){return name;} public String getLocation(){return location;} public LocalDate getDate(){return date;} public String getOrganizer(){return organizer;}
}
