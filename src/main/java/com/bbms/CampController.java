package com.bbms;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate; import java.util.List;
@RestController @RequestMapping("/api/camps")
public class CampController {
 private final CampRepository repo; public CampController(CampRepository r){repo=r;}
 @GetMapping public List<Camp> all(){return repo.findAll();}
 @PostMapping public Camp create(@Valid @RequestBody CampRequest r){return repo.save(new Camp(r.name(),r.location(),r.date(),r.organizer()));}
 public record CampRequest(@NotBlank String name,@NotBlank String location,LocalDate date,String organizer){}
}
