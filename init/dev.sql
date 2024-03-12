create table comments
(
    id         integer primary key autoincrement          not null,
    uid        varchar(255)                               not null,
    topic_id   integer unsigned                           not null,
    root_id    integer unsigned,
    to_id      integer unsigned,
    status     tinyint unsigned default 0                 not null,
    content    text                                       not null,
    created_at datetime         default current_timestamp not null,
    foreign key (uid) references accounts (id),
    foreign key (topic_id) references topics (id)
);
