package com.bbms;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
@Entity @Table(name="users")
public class User {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(unique=true,nullable=false) private String username;
 @Column(nullable=false) private String fullName;
 @Column(unique=true,nullable=false) private String email;
 @Column(nullable=false) private String passwordHash;
 @Column(nullable=false) private String bloodGroup;
 private String role="DONOR";
 protected User(){}
 public User(String n,String e,String p,String b){this(n,e,p,b,"DONOR");}
 public User(String n,String e,String p,String b,String r){username=e;fullName=n;email=e;passwordHash=p;bloodGroup=b;role=r!=null?r.toUpperCase():"DONOR";}
 public Long getId(){return id;} public String getUsername(){return username;} public String getFullName(){return fullName;} public String getEmail(){return email;}
 public String getBloodGroup(){return bloodGroup;} public String getRole(){return role;} public void setRole(String r){role=r;}
 @JsonIgnore public String getPasswordHash(){return passwordHash;}
}
