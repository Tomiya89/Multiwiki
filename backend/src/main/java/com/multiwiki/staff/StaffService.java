package com.multiwiki.staff;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.multiwiki.staff.requests.CreateStaffRequest;
import com.multiwiki.user.User;
import com.multiwiki.wiki.Wiki;

@Service
public class StaffService{
    @Autowired
    private StaffRepository staffRepository;

    public List<Staff> findByWiki(Wiki wiki){
        return this.staffRepository.findByWiki(wiki);
    }

    public Optional<Staff> findByWikiAndUser(Wiki wiki, User user){
        return this.staffRepository.findByWikiAndUser(wiki, user);
    }

    public Staff create(CreateStaffRequest request) throws Exception, AccessDeniedException {
        if(this.staffRepository.existsByWikiAndUser(request.getWiki(), request.getUser()))
            throw new AccessDeniedException("User is have role");

        try {
            EnumStaffRole role = EnumStaffRole.valueOf(request.getRole());
            Staff staff = new Staff();
            staff.setWiki(request.getWiki());
            staff.setRole(role);
            staff.setUser(request.getUser());
            staff.setCreatedBy(request.getRequester().getId());
            return this.staffRepository.save(staff);
        } catch (IllegalArgumentException e) {
            throw new AccessDeniedException("Invalid role: " + request.getRole());
        }
    }

    public Staff update(Staff entity) {
        return this.staffRepository.save(entity);
    }

    public void delete(Staff entity) throws Exception {
        this.staffRepository.delete(entity);
    }

    public boolean isHaveStaff(Wiki wiki, User user){
        Optional<Staff> staff = this.staffRepository.findByWikiAndUser(wiki, user);
        return staff.isPresent();
    }

    public boolean isOwner(Wiki wiki, User user){
        Optional<Staff> staff = this.staffRepository.findByWikiAndUser(wiki, user);
        return staff.isPresent() ? staff.get().getRole().equals(EnumStaffRole.OWNER.name()) : false;
    }

    public EnumStaffRole getRole(Wiki wiki, User user) throws IllegalArgumentException{
        Optional<Staff> staff = this.staffRepository.findByWikiAndUser(wiki, user);
        if(staff.isEmpty())
            throw new IllegalArgumentException("This user is not have staff");

        return EnumStaffRole.valueOf(staff.get().getRole());
    }

    public Page<Staff> getStaffs(Wiki wiki, String query, Pageable pageable) {
        if (query != null && !query.isEmpty()) {
            return staffRepository.findByWikiAndUserUsernameContainingIgnoreCase(wiki, query, pageable);
        }
        return staffRepository.findByWikiWithUser(wiki, pageable);
    }

    public Page<Staff> findByUser(User user, Pageable pageable){
        return this.staffRepository.findByUser(user, pageable);
    }
}
