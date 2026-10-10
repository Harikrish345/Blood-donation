package com.bbms;
import org.springframework.web.bind.annotation.*; import java.util.Map;
@RestController @RequestMapping("/api/dashboard") public class DashboardController {
 private final InventoryRepository inventory; private final BloodRequestRepository requests; private final UserRepository users; private final CampRepository camps;
 public DashboardController(InventoryRepository i,BloodRequestRepository r,UserRepository u,CampRepository c){inventory=i;requests=r;users=u;camps=c;}
 @GetMapping public Map<String,Object> summary(){return Map.of("totalDonors",users.count(),"inventoryUnits",inventory.findAll().stream().mapToInt(BloodInventory::getQuantity).sum(),"pendingRequests",requests.countByStatus("PENDING"),"upcomingCamps",camps.count());}
}
