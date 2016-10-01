package main

import (
	"database/sql"
	_ "encoding/json"
	"errors"
	"fmt"
	_ "github.com/BurntSushi/toml"
	"github.com/gin-gonic/gin"
	"github.com/lib/pq"
	"net/http"
	"os"
	"strings"
	"time"
)

func main() {
	os.Chdir("/home/harapan/app/mulberry/www/")
	router := getRouter()
	server := getServer(router)
	server.ListenAndServe()
}

func getRouter() (router *gin.Engine) {
	router = gin.Default()

	router.StaticFile("/", "page/index.html")
	anken_router := router.Group("/anken")
	{
		anken_router.POST("/api/search", ankenSearchEp)
		anken_router.POST("/api/add", ankenAddEp)
		anken_router.POST("/api/update", helloEp)
	}
	ver_router := router.Group("/anken/ver")
	{
		ver_router.POST("/api/search", ankenVerSearchEp)
		ver_router.POST("/api/add", helloEp)
		ver_router.POST("/api/update", helloEp)
		ver_router.POST("/api/delete", helloEp)
		ver_router.POST("/api/save", ankenVerSaveEp)
	}
	//TODO SPA?
	settings_router := router.Group("/settings")
	{
		settings_router.GET("/api/search", mstSearchEp)
		settings_router.POST("/api/add", mstAddEp)
		settings_router.POST("/api/update", helloEp)
	}
	return router
}

func getServer(router *gin.Engine) (server *http.Server) {
	server = &http.Server{
		Addr:           ":8080",
		Handler:        router,
		ReadTimeout:    10 * time.Second,
		WriteTimeout:   10 * time.Second,
		MaxHeaderBytes: 1 << 20,
	}
	return server
}

type response struct {
	Body interface{}
	Err  string
}

func helloEp(c *gin.Context) {
	c.String(200, "Hello, world.")
	return
}

func ankenSearchEp(c *gin.Context) {
	q := getQueryUnit(c)
	//TODO id -> name by join
	//TODO show created date and user
	ret, err := search(q)
	res_err := HandleError(err) //TODO
	respondWithJSON(c, 200, response{Body: ret, Err: res_err})
}

func ankenAddEp(c *gin.Context) {
	q := getQueryUnit(c)
	err := addAnken(q)
	res_err := HandleError(err) //TODO
	respondWithJSON(c, 200, response{Err: res_err})
	return
}

func ankenVerSearchEp(c *gin.Context) {
	//TODO id -> name by join
	//TODO show created date and user
	q := getQueryUnit(c)
	ret, err := search(q)
	res_err := HandleError(err) //TODO
	respondWithJSON(c, 200, response{Body: ret, Err: res_err})
}

func ankenVerSaveEp(c *gin.Context) {
	qs := getBulkQueryUnit(c)
  err := bulkMergePg(qs)
	res_err := HandleError(err) //TODO
	respondWithJSON(c, 200, response{Err: res_err})
}

func ankenVerPhaseSearchEp(c *gin.Context) {
	//TODO id -> name by join
	//TODO show created date and user
	q := getQueryUnit(c)
	ret, err := search(q)
	res_err := HandleError(err) //TODO
	respondWithJSON(c, 200, response{Body: ret, Err: res_err})
}

func ankenVerPhaseFuncSearchEp(c *gin.Context) {
	//TODO id -> name by join
	//TODO show created date and user
	q := getQueryUnit(c)
	ret, err := search(q)
	res_err := HandleError(err) //TODO
	respondWithJSON(c, 200, response{Body: ret, Err: res_err})
}

func mstSearchEp(c *gin.Context) {
	var qs []queryUnit
	for _, target := range Uniq(strings.Split(c.Query("Target"), ",")) {
		qs = append(qs, queryUnit{
			Target: getPgTarget(target),
			Params: nil,
		})
	}
	ret, err := msearch(qs)
	res_err := HandleError(err) //TODO
	respondWithJSON(c, 200, response{Body: ret, Err: res_err})
	return
}

func mstAddEp(c *gin.Context) {
	//TODO 1 post req per 1 user
	u := getQueryUnit(c)
	err := u.insertPg()
	res_err := HandleError(err) //TODO
	respondWithJSON(c, 200, response{Err: res_err})
	return
}

func Uniq(elms []string) (ret []string) {
	encountered := map[string]bool{}
	for i := range elms {
		if encountered[elms[i]] {
			continue
		}
		ret = append(ret, elms[i])
		encountered[elms[i]] = true
	}
	return
}

func addAnken(q *queryUnit) (err error) {
	_, err = validateExists(q.Params, "customer_id", "m_customer", "customer_id")
	if err != nil {
		return
	}

	var user_id interface{}
	user_id, err = validateExists(q.Params, "user_id", "m_user", "user_id")
	if err != nil {
		return
	}

	var anken_id string
	anken_id, err = nextvalPg("anken_id")
	if err != nil {
		return
	}

	q.Params = append(q.Params, queryUnitParam{
		Key:   "anken_id",
		Value: anken_id,
	})

	var db *sql.DB
	db, err = getPgConn()
	if err != nil {
		return
	}
	defer db.Close()

	var tx *sql.Tx
	tx, err = db.Begin()
	if err != nil {
		return
	}
	defer tx.Rollback()

	err = q.insertPgWithTx(tx)
	if err != nil {
		return
	}

	yyyymmdd := time.Now().Format("20060102")
	anken_ver := "1"
	phase_id := "1" //TODO valid?

	verq := &queryUnit{
		Target: "t_anken_ver",
		Params: []queryUnitParam{
			{Key: "anken_id", Value: anken_id},
			{Key: "anken_ver", Value: anken_ver},
			{Key: "anken_ver_name", Value: "first version"},
			{Key: "user_id", Value: user_id},
			{Key: "sort_order", Value: "1"},
			{Key: "term_from", Value: yyyymmdd},
			{Key: "term_to", Value: yyyymmdd},
		},
	}
	err = verq.insertPgWithTx(tx)

	phsq := &queryUnit{
		Target: "t_anken_ver_phase",
		Params: []queryUnitParam{
			{Key: "anken_id", Value: anken_id},
			{Key: "anken_ver", Value: anken_ver},
			{Key: "phase_id", Value: phase_id},
			{Key: "phase_name", Value: "main phase"},
			{Key: "is_main", Value: "1"},
			{Key: "sort_order", Value: "1"},
			{Key: "term_from", Value: yyyymmdd},
			{Key: "term_to", Value: yyyymmdd},
		},
	}
	err = phsq.insertPgWithTx(tx)
	if err != nil {
		return
	}

	err = tx.Commit()
	return
}

func validateExists(params []queryUnitParam, key string, table string, column string) (ret interface{}, err error) {
	ret, err = getQueryUnitParamValue(params, key)
	if err != nil {
		return
	}
	var exists bool
	exists, err = existsPg(table, column, ret)
	if err != nil {
		return
	}
	if !exists {
		errors.New(fmt.Sprintf("%s does not exist.", ret))
		return
	}
	return
}

func respondWithJSON(c *gin.Context, status_code int, res response) {
	fmt.Println(fmt.Sprintf("\n%v\n", res))
	c.JSON(status_code, res)
}

func getQueryUnitParamValue(params []queryUnitParam, key string) (ret interface{}, err error) {
	err = errors.New(fmt.Sprintf("%s does not exist.", key))
	for _, param := range params {
		if param.Key == key {
			ret = param.Value
			err = nil
			break
		}
	}
	return
}

func HandleError(err error) (err_msg string) {
	//TODO
	if err != nil {
		fmt.Printf("[ERROR] %v", err)
		err_msg = err.Error()
	}
	return
}

func getPgConn() (db *sql.DB, err error) {
	db, err = sql.Open("postgres", "postgres://user:password@127.0.0.1:5432/database?sslmode=disable")
	return
}

type queryUnit struct {
	Target string
  Method string
	Params []queryUnitParam
}

type queryUnitParam struct {
	Key      string
	Whereope string
	Value    interface{}
}

func getQueryUnit(c *gin.Context) (ret *queryUnit) {
	q := &queryUnit{}
	c.Bind(q)
	ret = &queryUnit{
		Target: getPgTarget(q.Target),
		Params: q.Params,
	}
	return
}

func getBulkQueryUnit(c *gin.Context) (ret []queryUnit) {
	qs := &[]queryUnit{}
	c.Bind(qs)
  for _, q := range *qs {
  	ret = append(ret, queryUnit{
  		Target: getPgTarget(q.Target),
  		Method: q.Method,
  		Params: q.Params,
  	})
  }
	return
}

func getPgTarget(target string) (ret string) {
	switch target {
	case "customer", "user", "type":
		ret = "m_" + target
	default:
		ret = "t_" + target
	}
	return
}

func existsSortOrder(target string) (ret bool) {
	switch target {
	case "anken_ver", "anken_ver_func_group", "anken_ver_func_weight", "anken_ver_phase", "anken_ver_phase_func":
		ret = true
	default:
		ret = false
	}
	return
}

func isPrivateColumn(column string) (ret bool) {
	switch column {
	case "created_at", "created_by", "updated_at", "updated_by":
		ret = true
	default:
		ret = false
	}
	return
}

type SearchRet struct {
	Target string
	Data   []map[string]interface{}
}

func msearch(qs []queryUnit) (ret []SearchRet, err error) {
	for _, q := range qs {
		var s SearchRet
		s, err = search(&q)
		if err != nil {
			return
		}
		ret = append(ret, s)
	}
	return
}

func search(q *queryUnit) (ret SearchRet, err error) {
	var rows *sql.Rows
	rows, err = q.selectPg()
	if err != nil {
		return
	}
	defer rows.Close()

	ret.Target = q.Target[2:]
	columns, _ := rows.Columns()
	count := len(columns)
	values := make([]interface{}, count)
	valuePtrs := make([]interface{}, count)
	for rows.Next() {
		for i, column := range columns {
			if isPrivateColumn(column) {
				continue
			}
			valuePtrs[i] = &values[i]
		}
		rows.Scan(valuePtrs...)
		search_ret_data := make(map[string]interface{})
		for i, column := range columns {
			if isPrivateColumn(column) {
				continue
			}
			var v interface{}
			value := values[i]
			b, ok := value.([]byte)
			if ok {
				v = string(b)
			} else {
				v = value
			}
			search_ret_data[column] = v
		}
		ret.Data = append(ret.Data, search_ret_data)
	}
	return
}

func (q *queryUnit) selectPg() (ret *sql.Rows, err error) {
	var db *sql.DB
	db, err = getPgConn()
	defer db.Close()

	select_sql := fmt.Sprintf("select * from %s", q.Target)
	var order_sql string
  if existsSortOrder(q.Target[2:]) {
    order_sql = "order by sort_order"
  } else {
    if q.Target[:2] == "t_" {
      order_sql = "order by id desc"
    } else {
      order_sql = "order by id"
    }
  }

	if len(q.Params) == 0 {
		ret, err = db.Query(fmt.Sprintf("%s %s", select_sql, order_sql))
	} else {
		ret, err = selectPgWithWhereStmt(db, q.Params, select_sql, order_sql)
	}
	return
}

func selectPgWithWhereStmt(db *sql.DB, params []queryUnitParam, select_sql string, order_sql string) (ret *sql.Rows, err error) {
	var where_sql string
	var values []interface{}
	for i, param := range params {
		err = param.validateWhereope()
		if err != nil {
			return
		}
		if i == 0 {
			where_sql = fmt.Sprintf("where %s %s $%d", param.Key, param.Whereope, i+1)
		} else {
			where_sql = fmt.Sprintf("%s and %s %s $%d", where_sql, param.Key, param.Whereope, i+1)
		}
		values = append(values, param.Value)
	}

	var stmt *sql.Stmt
	sql := fmt.Sprintf("%s %s %s", select_sql, where_sql, order_sql)
	fmt.Println(sql)
	stmt, err = db.Prepare(sql)
	if err != nil {
		return
	}
	defer stmt.Close()

	ret, err = stmt.Query(values...)
	return
}

func (q *queryUnitParam) validateWhereope() (err error) {
	switch q.Whereope {
	case "eq":
		q.Whereope = " = "
	case "like":
		q.Whereope = " LIKE "
		q.Value = "%" + q.Value.(string) + "%"
	case "flike":
		q.Whereope = " LIKE "
		q.Value = q.Value.(string) + "%"
	case "blike":
		q.Whereope = " LIKE "
		q.Value = "%" + q.Value.(string)
	case "lt":
		q.Whereope = " < "
	case "lte":
		q.Whereope = " <= "
	case "gt":
		q.Whereope = " > "
	case "gte":
		q.Whereope = " >= "
	default:
		errors.New(fmt.Sprintf("%s は演算子として認識できません", q.Whereope))
	}
	return
}

func existsPg(table string, column string, value interface{}) (ret bool, err error) {
	var db *sql.DB
	db, err = getPgConn()
	defer db.Close()

	var rows *sql.Rows
	sql := fmt.Sprintf("select 1 where exists(select 1 from %s where %s = $1)", table, column)
	rows, err = db.Query(sql, value)
	if err != nil {
		return
	}
	defer rows.Close()

	if !rows.Next() {
		err = errors.New(fmt.Sprintf("%s は未登録です", value))
		return
	}
	var ptr, v interface{}
	ptr = &v
	rows.Scan(ptr)
	if fmt.Sprintf("%v", v) == "1" {
		ret = true
	}
	return
}

func nextvalPg(seq_name string) (ret string, err error) {
	var db *sql.DB
	db, err = getPgConn()
	defer db.Close()

	row := db.QueryRow("select nextval($1)", seq_name)
	var ptr, v interface{}
	ptr = &v
	row.Scan(ptr)
	ret = fmt.Sprintf("%v", v)
	return
}

func bulkMergePg(qs []queryUnit) (err error) {
	var db *sql.DB
	db, err = getPgConn()
	if err != nil {
		return
	}
	defer db.Close()

	var tx *sql.Tx
	tx, err = db.Begin()
	if err != nil {
		return
	}
	defer tx.Rollback()

  for _, q := range qs {
    switch q.Method {
      case "add":
        err = q.insertPgWithTx(tx)
      case "update":
        err = q.updatePgWithTx(tx)
      default:
        err = errors.New("Invalid method.")
    }
  	if err != nil {
  		return
  	}
  }

	err = tx.Commit()
	return
}

func (q *queryUnit) insertPg() (err error) {
	var db *sql.DB
	db, err = getPgConn()
	if err != nil {
		return
	}
	defer db.Close()

	var tx *sql.Tx
	tx, err = db.Begin()
	if err != nil {
		return
	}
	defer tx.Rollback()

	err = q.insertPgWithTx(tx)
	if err != nil {
		return
	}

	err = tx.Commit()
	return
}

func (q *queryUnit) insertPgWithTx(tx *sql.Tx) (err error) {
	var columns []string
	var values []interface{}
	for _, param := range q.Params {
		columns = append(columns, param.Key)
		values = append(values, param.Value)
	}
	columns = append(columns, "created_at")
	values = append(values, time.Now())
	//TODO get user from session?
	columns = append(columns, "created_by")
	values = append(values, "developer")

  fmt.Printf("%s::%v::%v", q.Target, columns, values)

	var stmt *sql.Stmt
	stmt, err = tx.Prepare(pq.CopyIn(q.Target, columns...))
	if err != nil {
		return
	}
	defer stmt.Close()
	_, err = stmt.Exec(values...)
	if err != nil {
		return
	}
	_, err = stmt.Exec()
	return
}

func (q *queryUnit) updatePg() (err error) {
	var db *sql.DB
	db, err = getPgConn()
	if err != nil {
		return
	}
	defer db.Close()

	var tx *sql.Tx
	tx, err = db.Begin()
	if err != nil {
		return
	}
	defer tx.Rollback()

	err = q.updatePgWithTx(tx)
	if err != nil {
		return
	}

	err = tx.Commit()
	return
}

func (q *queryUnit) updatePgWithTx(tx *sql.Tx) (err error) {
	//TODO update updated_at, updated_by
	var set_sql string
  var where_sql string
	var values []interface{}
  i := 1
	for _, param := range q.Params {
		if param.Whereope == "" {
      if len(set_sql) == 0 {
        set_sql = fmt.Sprintf("set %s = $%d", param.Key, i)
      } else {
        set_sql = fmt.Sprintf("%s, %s = $%d", set_sql, param.Key, i)
      }
		  values = append(values, param.Value)
      i = i + 1
		}
	}
	for _, param := range q.Params {
		if param.Whereope != "" {
      if len(where_sql) == 0 {
        where_sql = fmt.Sprintf("where %s = $%d", param.Key, i)
      } else {
        where_sql = fmt.Sprintf("%s and %s = $%d", where_sql, param.Key, i)
      }
		  values = append(values, param.Value)
      i = i + 1
    }
	}

  update_sql := fmt.Sprintf("update %s %s %s", q.Target, set_sql, where_sql)
  fmt.Printf("%v::%v", update_sql, values)
	
  var stmt *sql.Stmt
	stmt, err = tx.Prepare(update_sql)
	if err != nil {
		return
	}
	defer stmt.Close()
	_, err = stmt.Exec(values...)
	return
}
