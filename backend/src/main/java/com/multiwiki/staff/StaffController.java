package com.multiwiki.staff;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.multiwiki.staff.requests.CreateStaffRequest;
import com.multiwiki.staff.requests.UpdateStaffRequest;
import com.multiwiki.staff.responses.StaffErrorResponse;
import com.multiwiki.user.EnumUserRole;
import com.multiwiki.user.User;
import com.multiwiki.user.UserService;
import com.multiwiki.wiki.Wiki;
import com.multiwiki.wiki.WikiService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/wikis/{wikiName}/staffs")
public class StaffController {
    @Autowired
    private StaffService staffService;

    @Autowired
    private WikiService wikiService;

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal User requester, @PathVariable("wikiName") String wikiName){
        Optional<Wiki> opt_wiki = this.wikiService.findByName(wikiName);
        if(opt_wiki.isEmpty())
            return ResponseEntity.notFound().build();

        Wiki wiki = opt_wiki.get();

        Optional<Staff> requesterStaff = this.staffService.findByWikiIdAndUserId(wiki.getId(), requester.getId());
        if(requesterStaff.isEmpty())
            return ResponseEntity.notFound().build();

        return ResponseEntity.ok(new StaffResponseDTO(requesterStaff.get()));
    }

    @GetMapping
    public ResponseEntity<?> getAllStaffs(@AuthenticationPrincipal User requester, @PathVariable("wikiName") String wikiName,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(required = false) String query) {
        Optional<Wiki> opt_wiki = this.wikiService.findByName(wikiName);
        if(opt_wiki.isEmpty())
            return ResponseEntity.notFound().build();

        Wiki wiki = opt_wiki.get();

        Optional<Staff> requesterStaff = this.staffService.findByWikiIdAndUserId(wiki.getId(), requester.getId());
        
        if(!requester.getRole().equals(EnumUserRole.ADMIN.name()) && (requesterStaff.isEmpty() && wiki.getUserId() != requester.getId() || !requesterStaff.isEmpty() && requesterStaff.get().getRole() != EnumStaffRole.OWNER.name()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new StaffErrorResponse(EnumStaffResponse.STAFF_ACCESS_DENIED));

        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());

        Page<Staff> staffPage = this.staffService.getStaffs(wiki.getId(), query, pageable);

        Page<StaffResponseDTO> response = staffPage.map(StaffResponseDTO::new);

        return ResponseEntity.ok().body(response);
    }
    
    @GetMapping("/{userId}")
    public ResponseEntity<?> getStaff(@AuthenticationPrincipal User requester, @PathVariable("wikiName") String wikiName, @PathVariable("userId") int userId) {
        Optional<Wiki> opt_wiki = this.wikiService.findByName(wikiName);
        if(opt_wiki.isEmpty())
            return ResponseEntity.notFound().build();
        
        Wiki wiki = opt_wiki.get();

        Optional<Staff> requesterStaff = this.staffService.findByWikiIdAndUserId(wiki.getId(), requester.getId());
        
        if(!requester.getRole().equals(EnumUserRole.ADMIN.name()) && (requesterStaff.isEmpty() && wiki.getUserId() != requester.getId() || !requesterStaff.isEmpty() && requesterStaff.get().getRole() != EnumStaffRole.OWNER.name()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new StaffErrorResponse(EnumStaffResponse.STAFF_ACCESS_DENIED));

        Optional<Staff> staff = this.staffService.findByWikiIdAndUserId(wiki.getId(), userId);
        if(staff.isEmpty())
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok().body(new StaffResponseDTO(staff.get()));
    }

    @PostMapping
    public ResponseEntity<?> createStaff(@AuthenticationPrincipal User requester, @PathVariable("wikiName") String wikiName, @Valid @RequestBody CreateStaffRequest request) {
        Optional<Wiki> opt_wiki = this.wikiService.findByName(wikiName);
        if(opt_wiki.isEmpty())
            return ResponseEntity.notFound().build();
        
        Wiki wiki = opt_wiki.get();
    
        Optional<Staff> requesterStaff = this.staffService.findByWikiIdAndUserId(wiki.getId(), requester.getId());
        
        if(!requester.getRole().equals(EnumUserRole.ADMIN.name()) && (requesterStaff.isEmpty() && wiki.getUserId() != requester.getId() || !requesterStaff.isEmpty() && requesterStaff.get().getRole() != EnumStaffRole.OWNER.name()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new StaffErrorResponse(EnumStaffResponse.STAFF_ACCESS_DENIED));

        Optional<User> opt_user;

        if(request.getUserId() != 0){
            opt_user = this.userService.getById(request.getUserId());
        }else if(!request.getUsername().trim().isEmpty()){
            opt_user = this.userService.getByUsername(request.getUsername());
        }else
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new StaffErrorResponse(EnumStaffResponse.STAFF_ID_OR_USERNAME_IS_REQUIRED));

        if(opt_user.isEmpty())
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new StaffErrorResponse(EnumStaffResponse.STAFF_USER_NOT_FOUND));

        User user = opt_user.get();

        request.setRequester(requester);
        request.setWiki(wiki);
        request.setUser(user);

        try {
            Staff staff = this.staffService.create(request);
            return ResponseEntity.ok().body(new StaffResponseDTO(staff));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new StaffErrorResponse(EnumStaffResponse.STAFF_USER_IS_ADDED));
        }
        catch(Exception e){
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new StaffErrorResponse(EnumStaffResponse.STAFF_ROLE_UNDEFINED));
        }
    }
    
    @PutMapping("/{userId}")
    public ResponseEntity<?> updateStaff(@AuthenticationPrincipal User requester, @PathVariable("wikiName") String wikiName, @PathVariable("userId") int userId, @Valid @RequestBody UpdateStaffRequest request) {
        Optional<Wiki> opt_wiki = this.wikiService.findByName(wikiName);
        if(opt_wiki.isEmpty())
            return ResponseEntity.notFound().build();
        
        Wiki wiki = opt_wiki.get();
        
        Optional<Staff> requesterStaff = this.staffService.findByWikiIdAndUserId(wiki.getId(), requester.getId());

        if(!requester.getRole().equals(EnumUserRole.ADMIN.name()) && (requesterStaff.isEmpty() && wiki.getUserId() != requester.getId() || !requesterStaff.isEmpty() && requesterStaff.get().getRole() != EnumStaffRole.OWNER.name()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new StaffErrorResponse(EnumStaffResponse.STAFF_ACCESS_DENIED));

        Optional<Staff> opt_staff = this.staffService.findByWikiIdAndUserId(wiki.getId(), userId);

        if(opt_staff.isEmpty())
            return ResponseEntity.notFound().build();
        
        Staff staff = opt_staff.get();
        try{
            EnumStaffRole role = EnumStaffRole.valueOf(request.getRole());
            staff.setRole(role);
        }catch(IllegalArgumentException e){
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new StaffErrorResponse(EnumStaffResponse.STAFF_ROLE_UNDEFINED));
        }

        this.staffService.update(staff);

        return ResponseEntity.ok(new StaffResponseDTO(staff));
    }
    
    @DeleteMapping("{userId}")
    public ResponseEntity<?> deleteStaff(@AuthenticationPrincipal User requester, @PathVariable("wikiName") String wikiName, @PathVariable("userId") int userId){
        Optional<Wiki> opt_wiki = this.wikiService.findByName(wikiName);
        if(opt_wiki.isEmpty())
            return ResponseEntity.notFound().build();
        
        Wiki wiki = opt_wiki.get();

        Optional<Staff> requesterStaff = this.staffService.findByWikiIdAndUserId(wiki.getId(), requester.getId());
        
        if(!requester.getRole().equals(EnumUserRole.ADMIN.name()) && (requesterStaff.isEmpty() && wiki.getUserId() != requester.getId() || !requesterStaff.isEmpty() && requesterStaff.get().getRole() != EnumStaffRole.OWNER.name()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new StaffErrorResponse(EnumStaffResponse.STAFF_ACCESS_DENIED));

        Optional<Staff> opt_staff = this.staffService.findByWikiIdAndUserId(wiki.getId(), userId);

        if(opt_staff.isEmpty())
            return ResponseEntity.notFound().build();
        
        Staff staff = opt_staff.get();

        if(staff.getRole().equals("ADMIN") && requesterStaff.isPresent())
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new StaffErrorResponse(EnumStaffResponse.STAFF_ACCESS_DENIED));

        try{
            this.staffService.delete(staff);
        }
        catch(Exception e){
        }
        
        return ResponseEntity.ok().build();
    }
}