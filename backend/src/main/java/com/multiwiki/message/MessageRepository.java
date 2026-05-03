package com.multiwiki.message;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MessageRepository extends JpaRepository<Message, Integer>, JpaSpecificationExecutor<Message> {
    Page<Message> findByAttachableTypeAndAttachableIdAndParentId(String attachableType, int attachableId, int parentId, Pageable pageable);

    @Query(value = "SELECT m FROM Message m WHERE m.attachableType = :attachableType " +
                   "AND m.attachableId = :attachableId AND m.parentId = :parentId " +
                   "AND (m.id < :lastId OR :lastId = 0) ORDER BY m.id DESC",
           countQuery = "SELECT count(m) FROM Message m WHERE m.attachableType = :attachableType " +
                        "AND m.attachableId = :attachableId AND m.parentId = :parentId " +
                        "AND (m.id < :lastId OR :lastId = 0)")
    Page<Message> findNextPage(@Param("attachableType") String attachableType,
                               @Param("attachableId") int attachableId,
                               @Param("parentId") int parentId,
                               @Param("lastId") int lastId,
                               Pageable pageable);

                               
}
