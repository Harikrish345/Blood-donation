package com.bbms;
import org.springframework.data.jpa.repository.JpaRepository;
public interface BloodRequestRepository extends JpaRepository<BloodRequest,Long>{long countByStatus(String status);}
