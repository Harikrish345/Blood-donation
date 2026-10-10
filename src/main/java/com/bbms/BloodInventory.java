package com.bbms;
import jakarta.persistence.*;
@Entity @Table(name="blood_inventory")
public class BloodInventory {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
  @Column(unique=true, nullable=false) private String bloodGroup;
  private int quantity;
  protected BloodInventory() {}
  public BloodInventory(String bloodGroup, int quantity) { this.bloodGroup=bloodGroup; this.quantity=quantity; }
  public Long getId(){return id;} public String getBloodGroup(){return bloodGroup;} public int getQuantity(){return quantity;}
  public void setQuantity(int quantity){this.quantity=quantity;}
  public String getStatus(){ return quantity < 20 ? "Critical" : quantity < 50 ? "Low Stock" : "Available"; }
}
