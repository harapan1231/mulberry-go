--select 'drop table if exists "' || tablename || '" cascade;' from pg_tables where schemaname = 'public';
create table t_anken (
  id serial not null unique,
  anken_id integer not null,
  anken_name varchar(60) not null,
  customer_id varchar(20) not null,
  user_id varchar(20) not null,
  status char(1) not null default '0',
  note varchar(250),
  created_at timestamp not null,
  created_by varchar(20) not null,
  updated_at timestamp,
  updated_by varchar(20),
  primary key(anken_id)
);

create table t_anken_ver (
  id serial not null unique,
  anken_id integer not null,
  anken_ver integer not null default 1,
  anken_ver_name varchar(40) not null,
  sort_order integer not null,
  user_id varchar(20) not null,
  term_from char(8) not null,
  term_to char(8) not null,
  status char(1) not null default '0',
  note varchar(250),
  created_at timestamp not null,
  created_by varchar(20) not null,
  updated_at timestamp,
  updated_by varchar(20),
  constraint u1_t_anken_ver unique (anken_id, anken_ver, sort_order),
  primary key(anken_id, anken_ver)
);

create table t_anken_ver_phase (
  id serial not null unique,
  anken_id integer not null,
  anken_ver integer not null,
  phase_id integer not null,
  phase_name varchar(12) not null,
  is_main char(1) not null default false,
  sort_order integer not null,
  scale_pct_per_main integer not null default 100,
  unit_price integer not null default 0,
  term_from char(8) not null,
  term_to char(8) not null,
  members integer not null default 0,
  created_at timestamp not null,
  created_by varchar(20) not null,
  updated_at timestamp,
  updated_by varchar(20),
  constraint u1_t_anken_ver_phase unique (anken_id, anken_ver, phase_id, sort_order),
  primary key(anken_id, anken_ver, phase_id)
);

create table t_anken_ver_func_group (
  id serial not null unique,
  anken_id integer not null,
  anken_ver integer not null,
  func_group_id char(2) not null,
  func_group_name varchar(12) not null,
  sort_order integer not null unique,
  created_at timestamp not null,
  created_by varchar(20) not null,
  updated_at timestamp,
  updated_by varchar(20),
  constraint u1_t_anken_ver_func_group unique (anken_id, anken_ver, func_group_id, sort_order),
  primary key(anken_id, anken_ver, func_group_id)
);

create table t_anken_ver_func_weight (
  id serial not null unique,
  anken_id integer not null,
  anken_ver integer not null,
  func_type char(2) not null,
  weight_type char(1) not null,
  person_days double precision not null default 0.0,
  created_at timestamp not null,
  created_by varchar(20) not null,
  updated_at timestamp,
  updated_by varchar(20),
  primary key(anken_id, anken_ver, func_type, weight_type)
);

create table t_anken_ver_phase_func (
  id serial not null unique,
  anken_id integer not null,
  anken_ver integer not null,
  phase_id integer not null,
  func_id serial not null,
  func_name varchar(30) not null,
  person_days double precision not null default 0.0,
  sort_order integer not null,
  func_group_id char(2) not null,
  func_type char(2) not null,
  weight_type char(1) not null,
  note varchar(250),
  created_at timestamp not null,
  created_by varchar(20) not null,
  updated_at timestamp,
  updated_by varchar(20),
  constraint u1_t_anken_ver_phase_func unique (anken_id, anken_ver, phase_id, func_id, sort_order),
  primary key(anken_id, anken_ver, phase_id, func_id)
);

create table m_customer (
  id serial not null unique,
  customer_id varchar(20) not null,
  customer_name varchar(100) not null,
  created_at timestamp not null,
  created_by varchar(20) not null,
  updated_at timestamp,
  updated_by varchar(20),
  primary key(customer_id)
);

create table m_user (
  id serial not null unique,
  user_id varchar(20) not null,
  user_name varchar(30) not null,
  created_at timestamp not null,
  created_by varchar(20) not null,
  updated_at timestamp,
  updated_by varchar(20),
  primary key(user_id)
);

--status, func_type, weight
create table m_type (
  id serial not null unique,
  type_group_id varchar(8) not null,
  type_id char(1) not null,
  description varchar(12) not null,
  created_at timestamp not null,
  created_by varchar(20) not null,
  updated_at timestamp,
  updated_by varchar(20),
  primary key(type_group_id, type_id)
);

create sequence anken_id owned by t_anken.anken_id;

